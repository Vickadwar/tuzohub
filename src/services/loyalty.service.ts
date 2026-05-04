import { db } from "../db";
import { transactions, pointLots, redemptionsQueue, wallets, vouchers, voucherBatches, consumers, campaigns, products, auditLogs, purchases, towns, regions } from "../db/schema";
import { WalletRepository } from "../db/repositories/wallet.repo";
import { sql, eq, and, desc, gte, lte, count, sum } from "drizzle-orm";
import { CampaignEngine, PurchaseContext } from "./campaign.engine";
import { DarajaService } from "./daraja.service";
import { tenants } from "../db/schema";
import { FraudService } from "./fraud.service";
import { GamificationService } from "./gamification.service";
import { ReferralService } from "./referral.service";
import { DarajaConfig } from "./daraja.service";
import { tenantSettings } from "../db/schema";

export class LoyaltyService {
  /**
   * Processes a point earning event (Purchase, Promotion, etc.)
   */
  static async processEarning(
    params: {
      tenantId: string;
      consumerId: string;
      points: string;
      actionCategory: string;
      description?: string;
      expiryMonths?: number;
      campaignId?: string;
      metadata?: any;
    },
    tx: any // Using 'any' to accommodate both db and tx
  ) {
    const { tenantId, consumerId, points, actionCategory, description, expiryMonths = 12, campaignId, metadata } = params;

    // 1. Get Wallet
    let wallet = await WalletRepository.findByOwner(tenantId, consumerId, "CONSUMER", tx);
    if (!wallet) {
      throw new Error("Consumer wallet not found");
    }

    // 2. Calculate Expiry
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + expiryMonths);

    // 3. Create Transaction
    const [transaction] = await tx
      .insert(transactions)
      .values({
        tenantId,
        walletId: wallet.id,
        campaignId,
        accountingEntry: "CREDIT",
        actionCategory,
        pointsAmount: points,
        balanceAfter: (parseFloat(wallet.pointsBalance) + parseFloat(points)).toString(),
        expiresAt,
        description,
        metadata: metadata || null,
      })
      .returning();

    // 3.5 Update Consumer Lifetime Metrics
    await tx.update(consumers)
      .set({
        totalPointsEarnedLifetime: sql`${consumers.totalPointsEarnedLifetime} + ${points}`,
        updatedAt: new Date(),
      })
      .where(eq(consumers.id, consumerId));

    // 4. Create Point Lot (FIFO Record)
    await tx.insert(pointLots).values({
      tenantId,
      transactionId: transaction.id,
      originalAmount: points,
      remainingAmount: points,
      expiresAt,
    });

    // 5. Update Wallet Balance (Optimistic Locking)
    await WalletRepository.updateBalance(tx, wallet.id, points, wallet.version);

    return transaction;
  }

  /**
   * Processes a purchase event, automatically evaluating campaigns and rules.
   */
  static async processPurchase(
    context: PurchaseContext,
    tx: any = db
  ) {
    // 1. Find applicable campaign
    const campaign = await CampaignEngine.findApplicableCampaign(context, tx);

    // 2. Fetch tenant default conversion or campaign override
    // For now, let's assume a default of 1 point per currency unit if no campaign
    const pointsAmount = CampaignEngine.calculatePoints(context.totalAmount, campaign);

    // 2.5 Security: Check EARNING Velocity (Fraud Trap)
    await FraudService.evaluateVelocity(context.tenantId, context.consumerId, Number(pointsAmount), tx);

    // 3. Delegate to processEarning
    const transaction = await this.processEarning(
      {
        tenantId: context.tenantId,
        consumerId: context.consumerId,
        points: pointsAmount.toString(),
        actionCategory: "PURCHASE",
        description: campaign ? `Earned via campaign: ${campaign.name}` : "Standard purchase earning",
        campaignId: campaign?.id,
      },
      tx
    );

    // 4. Update Referrals & Gamification
    await ReferralService.completeReferralOnFirstPurchase(context.tenantId, context.consumerId, tx);
    await GamificationService.updateChallengeProgress(context.tenantId, context.consumerId, { action: "PURCHASE", amount: context.totalAmount }, tx);

    return transaction;
  }


  /**
   * Processes a points redemption (Spending points)
   * Implements FIFO logic to spend oldest points first
   */
  static async processRedemption(
    params: {
      tenantId: string;
      consumerId: string;
      pointsToRedeem: string;
      rewardItemId?: string;
      destinationAccount: string;
      amountValue: string;
      currencyCode: string;
      fulfillmentMode: "AUTOMATED_PAYOUT" | "INTERNAL_VOUCHER" | "MANUAL_FULFILLMENT";
      description?: string;
      metadata?: any;
    },
    tx: any
  ) {
    const { 
      tenantId, consumerId, pointsToRedeem, rewardItemId, description,
      destinationAccount, amountValue, currencyCode, fulfillmentMode, metadata
    } = params;
    const amountToSpend = parseFloat(pointsToRedeem);

    // 1. Get Wallet
    const wallet = await WalletRepository.findByOwner(tenantId, consumerId, "CONSUMER", tx);
    if (!wallet || parseFloat(wallet.pointsBalance) < amountToSpend) {
      throw new Error("Insufficient points balance");
    }

    // 2. FIFO Logic: Find active lots sorted by expiry
    const activeLots = await tx.query.pointLots.findMany({
      where: and(
        eq(pointLots.tenantId, tenantId),
        sql`remaining_amount > 0 AND expires_at > NOW()`
      ),
      orderBy: (lots: any, { asc }: any) => [asc(lots.expiresAt)],
    });

    let remainingToSpend = amountToSpend;
    for (const lot of activeLots) {
      if (remainingToSpend <= 0) break;

      const lotAmount = parseFloat(lot.remainingAmount);
      const spendFromThisLot = Math.min(lotAmount, remainingToSpend);

      await tx
        .update(pointLots)
        .set({
          remainingAmount: (lotAmount - spendFromThisLot).toString(),
        })
        .where(eq(pointLots.id, lot.id));

      remainingToSpend -= spendFromThisLot;
    }

    if (remainingToSpend > 0) {
      throw new Error("Insufficient valid (unexpired) points lots to fulfill redemption");
    }

    // 3. Create Transaction Record
    const [transaction] = await tx
      .insert(transactions)
      .values({
        tenantId,
        walletId: wallet.id,
        accountingEntry: "DEBIT",
        actionCategory: "REDEMPTION",
        pointsAmount: pointsToRedeem,
        balanceAfter: (parseFloat(wallet.pointsBalance) - amountToSpend).toString(),
        description,
        metadata: metadata || null,
      })
      .returning();

    // 3.5 Update Consumer Lifetime Metrics
    await tx.update(consumers)
      .set({
        totalSpent: sql`${consumers.totalSpent} + ${amountValue}`,
        updatedAt: new Date(),
      })
      .where(eq(consumers.id, consumerId));

    // 4. Update Wallet Balance
    await WalletRepository.updateBalance(tx, wallet.id, `-${pointsToRedeem}`, wallet.version);

    // 5. Enqueue for Automation
    const [queueItem] = await tx
      .insert(redemptionsQueue)
      .values({
        tenantId,
        consumerId,
        transactionId: transaction.id,
        rewardItemId: rewardItemId || null,
        destinationAccount,
        amountValue,
        currencyCode,
        fulfillmentMode,
        status: "PENDING",
      })
      .returning();

    return { transaction, queueItem };
  }

  /**
   * Approves a pending redemption and triggers the payout.
   */
  static async approveRedemption(id: string, tenantId: string, approvedBy: string) {
    const queueItem = await db.query.redemptionsQueue.findFirst({
      where: and(eq(redemptionsQueue.id, id), eq(redemptionsQueue.tenantId, tenantId)),
      with: { consumer: true }
    });

    if (!queueItem || queueItem.status !== "PENDING") {
      throw new Error("Invalid or already processed redemption request");
    }

    // 1. Mark as PROCESSING
    await db.update(redemptionsQueue)
      .set({ status: "PROCESSING", approvedBy, approvedAt: new Date() })
      .where(eq(redemptionsQueue.id, id));

    try {
      // 2. Fetch Tenant Credentials
      const tSettings = await db.query.tenantSettings.findFirst({
        where: eq(tenantSettings.tenantId, tenantId)
      });
      const creds = (tSettings?.credentials || {}) as any;

      // 2.1 Trigger Payout (Daraja)
      const darajaConfig: DarajaConfig = {
        consumerKey: creds.darajaConsumerKey || process.env.DARAJA_CONSUMER_KEY || "PLACEHOLDER",
        consumerSecret: creds.darajaConsumerSecret || process.env.DARAJA_CONSUMER_SECRET || "PLACEHOLDER",
        shortCode: creds.darajaShortCode || process.env.DARAJA_SHORTCODE || "600000",
        initiatorName: creds.darajaInitiatorName || "TUZO_INIT",
        initiatorPassword: creds.darajaInitiatorPassword || "Password123",
        securityCredential: creds.darajaSecurityCredential || "CREDENTIAL_HASH",
        callbackUrl: `${process.env.APP_URL}/api/mpesa/b2c/callback?tenantId=${tenantId}`,
        queueTimeOutUrl: `${process.env.APP_URL}/api/mpesa/b2c/timeout?tenantId=${tenantId}`,
        baseUrl: creds.darajaBaseUrl || "https://sandbox.safaricom.co.ke",
      };

      const result = await DarajaService.sendPayout({
        config: darajaConfig,
        amount: parseFloat(queueItem.amountValue),
        phoneNumber: queueItem.consumer.phoneNumber,
        remarks: `Loyalty Payout for ${queueItem.consumer.firstName}`,
      });

      // 3. Mark as SUCCESS
      await db.update(redemptionsQueue)
        .set({ 
          status: "SUCCESS", 
          externalReference: result.ConversationID,
        })
        .where(eq(redemptionsQueue.id, id));

      return { success: true, conversationId: result.ConversationID };

    } catch (error: any) {
      // 4. Rollback to FAILED
      await db.update(redemptionsQueue)
        .set({ status: "FAILED", lastError: error.message })
        .where(eq(redemptionsQueue.id, id));
      throw error;
    }
  }

  /**
   * Moves points between active balance and banked balance.
   */
  static async processBanking(
    params: {
      tenantId: string;
      consumerId: string;
      points: string;
      type: "BANK" | "UNBANK";
      description?: string;
    },
    tx: any
  ) {
    const { tenantId, consumerId, points, type, description } = params;
    const amount = parseFloat(points);

    const wallet = await WalletRepository.findByOwner(tenantId, consumerId, "CONSUMER", tx);
    if (!wallet) throw new Error("Wallet not found");

    if (type === "BANK") {
      if (parseFloat(wallet.pointsBalance) < amount) throw new Error("Insufficient points to bank");
      
      await tx.update(wallets)
        .set({
          pointsBalance: (parseFloat(wallet.pointsBalance) - amount).toString(),
          bankedPointsBalance: (parseFloat(wallet.bankedPointsBalance) + amount).toString(),
        })
        .where(eq(wallets.id, wallet.id));
    } else {
      if (parseFloat(wallet.bankedPointsBalance) < amount) throw new Error("Insufficient banked points");
      
      await tx.update(wallets)
        .set({
          pointsBalance: (parseFloat(wallet.pointsBalance) + amount).toString(),
          bankedPointsBalance: (parseFloat(wallet.bankedPointsBalance) - amount).toString(),
        })
        .where(eq(wallets.id, wallet.id));
    }

    // Log transaction for audit trail
    await tx.insert(transactions).values({
      tenantId,
      walletId: wallet.id,
      accountingEntry: type === "BANK" ? "DEBIT" : "CREDIT",
      actionCategory: "BANKING",
      pointsAmount: points,
      balanceAfter: (parseFloat(wallet.pointsBalance) + (type === "BANK" ? -amount : amount)).toString(),
      description: description || `Points ${type.toLowerCase()}ing`,
    });

    return { success: true };
  }

  /**
   * Redeems a digital voucher and credits the consumer's wallet.
   */
  static async redeemVoucher(
    params: {
      tenantId: string;
      consumerId: string;
      voucherCode?: string;
      serialNumber?: string;
    },
    tx: any = db
  ) {
    const { tenantId, consumerId, voucherCode, serialNumber } = params;

    if (!voucherCode && !serialNumber) {
      throw new Error("Must provide either voucherCode or serialNumber");
    }

    // 1. Find Voucher (Manual join to avoid missing relations issues)
    let condition = undefined;
    if (voucherCode) {
      condition = eq(vouchers.secureCodeHash, voucherCode);
    } else {
      condition = eq(vouchers.serialNumber, serialNumber!);
    }

    const [row] = await tx.select({
      id: vouchers.id,
      serialNumber: vouchers.serialNumber,
      status: vouchers.status,
      batchId: vouchers.batchId,
      tenantId: voucherBatches.tenantId,
      campaignId: voucherBatches.campaignId,
      productPoints: products.pointsPerUnit,
      productName: products.name,
    })
    .from(vouchers)
    .innerJoin(voucherBatches, eq(vouchers.batchId, voucherBatches.id))
    .leftJoin(products, eq(voucherBatches.productId, products.id))
    .where(and(condition, eq(vouchers.status, "ACTIVE")))
    .limit(1);

    if (!row) {
      // 1.5 Log Fraud Attempt
      await tx.insert(auditLogs).values({
        tenantId,
        action: "FRAUD_ATTEMPT",
        entityType: "VOUCHER",
        newData: { 
          consumerId, 
          voucherCode, 
          serialNumber, 
          reason: "Invalid or already used voucher" 
        },
      });
      throw new Error("Invalid or already used voucher code");
    }
    if (row.tenantId !== tenantId) throw new Error("Invalid voucher for this tenant");

    // 2. Mark as USED
    await tx.update(vouchers)
      .set({ 
        status: "REDEEMED",
        redeemedAt: new Date(),
        redeemedBy: consumerId
      })
      .where(eq(vouchers.id, row.id));

    // 3. Calculate points with Campaign Multipliers
    let finalPoints = parseFloat(row.productPoints?.toString() || "1");
    let campaignDesc = "";
    let campaignIdToLink = undefined;

    if (row.campaignId) {
      const [camp] = await tx.select().from(campaigns).where(eq(campaigns.id, row.campaignId));
      if (camp && camp.isActive && new Date() >= camp.startDate && (!camp.endDate || new Date() <= camp.endDate)) {
        finalPoints = finalPoints * parseFloat(camp.pointsMultiplier?.toString() || "1");
        campaignDesc = ` + x${parseFloat(camp.pointsMultiplier?.toString() || "1")} ${camp.name} Multiplier`;
        campaignIdToLink = camp.id;
      }
    }

    const pointsAmountToCredit = finalPoints.toString();

    // 4. Credit Wallet
    const earnRecord = await this.processEarning({
      tenantId,
      consumerId,
      points: pointsAmountToCredit,
      actionCategory: "VOUCHER_REDEMPTION",
      description: `Redeemed voucher ${row.serialNumber} (Product: ${row.productName || "Unknown"})${campaignDesc}`,
      campaignId: campaignIdToLink,
      metadata: {
        productName: row.productName,
        voucherSerialNumber: row.serialNumber,
      }
    }, tx);

    return { 
      success: true, 
      pointsAmount: pointsAmountToCredit, 
      serialNumber: row.serialNumber,
      productName: row.productName,
      earnRecord 
    };
  }

  /**
   * Administrative manual adjustment (Administrative Credit/Debit)
   */
  static async manualAdjustment(
    params: {
      tenantId: string;
      consumerId: string;
      points: string;
      type: "CREDIT" | "DEBIT";
      description?: string;
    },
    tx: any
  ) {
    const { tenantId, consumerId, points, type, description } = params;
    
    if (type === "CREDIT") {
      return await this.processEarning({
        tenantId,
        consumerId,
        points,
        actionCategory: "MANUAL_ADJUSTMENT",
        description,
      }, tx);
    } else {
      // For manual debit, we use processRedemption but with a generic reward item or manual tag
      // For the demo, we simplify:
      const wallet = await WalletRepository.findByOwner(tenantId, consumerId, "CONSUMER", tx);
      if (!wallet || parseFloat(wallet.pointsBalance) < parseFloat(points)) {
        throw new Error("Insufficient balance for manual debit");
      }

      await tx.update(wallets)
        .set({
          pointsBalance: (parseFloat(wallet.pointsBalance) - parseFloat(points)).toString(),
        })
        .where(eq(wallets.id, wallet.id));

      return await tx.insert(transactions).values({
        tenantId,
        walletId: wallet.id,
        accountingEntry: "DEBIT",
        actionCategory: "MANUAL_ADJUSTMENT",
        pointsAmount: points,
        balanceAfter: (parseFloat(wallet.pointsBalance) - parseFloat(points)).toString(),
        description,
      }).returning();
    }
  }

  // ─── READ METHODS ─────────────────────────────────────────────────────────

  /**
   * Returns the wallet snapshot for a consumer: current balance + lifetime earned.
   */
  static async getBalance(tenantId: string, consumerId: string, tx: any = db) {
    const wallet = await WalletRepository.findByOwner(tenantId, consumerId, "CONSUMER", tx);
    if (!wallet) throw new Error("Consumer wallet not found");

    return {
      consumerId,
      pointsBalance: wallet.pointsBalance,
      lifetimePointsEarned: wallet.lifetimePointsEarned,
      currency: "PTS",
      walletId: wallet.id,
      updatedAt: wallet.updatedAt,
    };
  }

  /**
   * Returns paginated transaction history for a consumer wallet.
   * Supports optional filters: type (CREDIT | DEBIT), from, to date range.
   */
  static async getTransactionHistory(params: {
    tenantId: string;
    consumerId: string;
    page: number;
    limit: number;
    type?: "CREDIT" | "DEBIT";
    from?: Date;
    to?: Date;
  }, tx: any = db) {
    const { tenantId, consumerId, page, limit, type, from, to } = params;

    // Resolve wallet first
    const wallet = await WalletRepository.findByOwner(tenantId, consumerId, "CONSUMER", tx);
    if (!wallet) throw new Error("Consumer wallet not found");

    // Build dynamic where conditions
    const conditions = [
      eq(transactions.tenantId, tenantId),
      eq(transactions.walletId, wallet.id),
    ];
    if (type) conditions.push(eq(transactions.accountingEntry, type));
    if (from) conditions.push(gte(transactions.createdAt, from));
    if (to)   conditions.push(lte(transactions.createdAt, to));

    const where = and(...conditions);
    const offset = (page - 1) * limit;

    // Fetch page + total count in parallel
    const [rows, totalResult] = await Promise.all([
      db.query.transactions.findMany({
        where,
        orderBy: [desc(transactions.createdAt)],
        limit,
        offset,
      }),
      db.select({ total: count() }).from(transactions).where(where),
    ]);

    const total = totalResult[0]?.total ?? 0;

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    };
  }

  /**
   * Aggregates main dashboard metrics for a tenant.
   */
  static async getOverviewStats(tenantId: string) {
    const [
      consumerCount,
      pointsIssued,
      pointsRedeemed,
      activeCampaignsCount,
      pendingRedemptionsCount,
      walletEconomy,
      recentQueue,
      recentCampaignsPerformance,
      tenantInfo,
      topProductsData,
      geographicReachData,
      recentTransactionsData
    ] = await Promise.all([
      // 1. Registered Consumers
      db.select({ count: count() }).from(consumers).where(eq(consumers.tenantId, tenantId)),
      
      // 2. Total Points Issued
      db.select({ total: sum(transactions.pointsAmount) })
        .from(transactions)
        .where(and(eq(transactions.tenantId, tenantId), eq(transactions.accountingEntry, "CREDIT"))),
      
      // 3. Total Points Redeemed (Debit)
      db.select({ total: sum(transactions.pointsAmount) })
        .from(transactions)
        .where(and(eq(transactions.tenantId, tenantId), eq(transactions.accountingEntry, "DEBIT"))),

      // 4. Active Campaigns
      db.select({ count: count() })
        .from(campaigns)
        .where(and(eq(campaigns.tenantId, tenantId), eq(campaigns.isActive, true))),

      // 5. Pending Redemptions Queue
      db.select({ count: count() })
        .from(redemptionsQueue)
        .where(and(eq(redemptionsQueue.tenantId, tenantId), eq(redemptionsQueue.status, "PENDING"))),

      // 6. Wallet Economy (Average Balance)
      db.select({ 
        avgBalance: sql<string>`avg(points_balance)`,
        totalCirculation: sql<string>`sum(points_balance)`
      })
      .from(wallets)
      .where(eq(wallets.tenantId, tenantId)),

      // 7. Recent Pending Redemptions
      db.query.redemptionsQueue.findMany({
        where: and(eq(redemptionsQueue.tenantId, tenantId), eq(redemptionsQueue.status, "PENDING")),
        orderBy: [desc(redemptionsQueue.createdAt)],
        limit: 5,
        with: {
          consumer: true
        }
      }),

      // 8. Active Campaigns with Performance
      db.select({
        id: campaigns.id,
        name: campaigns.name,
        issued: sql<string>`coalesce(sum(${transactions.pointsAmount}::numeric), 0)`,
        status: campaigns.isActive,
        endDate: campaigns.endDate
      })
      .from(campaigns)
      .leftJoin(transactions, eq(transactions.campaignId, campaigns.id))
      .where(and(eq(campaigns.tenantId, tenantId), eq(campaigns.isActive, true)))
      .groupBy(campaigns.id)
      .limit(3),

      // 9. Tenant Settings
      db.select({ defaultPointValue: tenants.defaultPointValue })
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1),

      // 10. Product Performance (Top 3 by Revenue, fallback to Recently Created)
      db.select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        totalVolume: sql<string>`COALESCE(SUM(CAST(transactions.metadata->>'quantity' AS NUMERIC)), 0)`,
        totalRevenue: sql<string>`COALESCE(SUM(transactions.points_amount), 0)`
      })
      .from(products)
      .leftJoin(transactions, and(
        eq(sql`CAST(transactions.metadata->>'productId' AS UUID)`, products.id),
        eq(transactions.actionCategory, "EARN"),
        eq(transactions.accountingEntry, "CREDIT")
      ))
      .where(eq(products.tenantId, tenantId))
      .groupBy(products.id, products.name, products.sku)
      .orderBy(desc(sql`SUM(transactions.points_amount)`), desc(products.createdAt))
      .limit(3),

      // 11. Geographic Reach (Consumers by Region)
      db.select({
        regionName: regions.name,
        consumerCount: count(consumers.id)
      })
      .from(consumers)
      .innerJoin(towns, eq(consumers.townId, towns.id))
      .innerJoin(regions, eq(towns.regionId, regions.id))
      .where(eq(consumers.tenantId, tenantId))
      .groupBy(regions.id, regions.name)
      .orderBy(desc(count(consumers.id)))
      .limit(5),

      // 12. Recent Successful Redemptions (Activity Fallback)
      db.query.transactions.findMany({
        where: and(
          eq(transactions.tenantId, tenantId),
          eq(transactions.accountingEntry, "DEBIT")
        ),
        orderBy: [desc(transactions.createdAt)],
        limit: 10,
        with: {
          wallet: {
            with: {
              consumer: true
            }
          }
        }
      })
    ]);

    // 12. Chart Data (Last 6 Months)
    const chartData = await db.execute(sql`
      SELECT 
        TO_CHAR(created_at, 'Mon') as month,
        accounting_entry as type,
        SUM(points_amount::numeric) as total
      FROM transactions
      WHERE tenant_id = ${tenantId}
      AND created_at > NOW() - INTERVAL '6 months'
      GROUP BY 1, 2
      ORDER BY MIN(created_at)
    `);

    return {
      metrics: {
        registeredConsumers: consumerCount[0]?.count ?? 0,
        totalPointsIssued: pointsIssued[0]?.total ?? "0",
        totalPointsRedeemed: pointsRedeemed[0]?.total ?? "0",
        activeCampaigns: activeCampaignsCount[0]?.count ?? 0,
        pendingRedemptions: pendingRedemptionsCount[0]?.count ?? 0,
        defaultPointValue: tenantInfo[0]?.defaultPointValue ?? "0.1",
      },
      walletEconomy: {
        averageBalance: walletEconomy[0]?.avgBalance ?? "0",
        totalCirculation: walletEconomy[0]?.totalCirculation ?? "0",
      },
      pendingQueue: recentQueue,
      recentTransactions: recentTransactionsData,
      activeCampaigns: recentCampaignsPerformance,
      topProducts: topProductsData,
      geographicReach: geographicReachData,
      chartData: chartData.rows
    };
  }

  /**
   * Returns paginated list of all transactions for a tenant.
   */
  static async getAllTransactions(params: {
    tenantId: string;
    page: number;
    limit: number;
    category?: string;
    accountingEntry?: "CREDIT" | "DEBIT";
  }, tx: any = db) {
    const { tenantId, page, limit, category, accountingEntry } = params;
    const offset = (page - 1) * limit;

    const conditions = [eq(transactions.tenantId, tenantId)];
    if (category) conditions.push(eq(transactions.actionCategory, category));
    if (accountingEntry) conditions.push(eq(transactions.accountingEntry, accountingEntry));

    const where = and(...conditions);

    const [rows, totalResult] = await Promise.all([
      db.query.transactions.findMany({
        where,
        orderBy: [desc(transactions.createdAt)],
        limit,
        offset,
        with: {
          wallet: {
            with: {
              consumer: true
            }
          }
        }
      }),
      db.select({ total: count() }).from(transactions).where(where),
    ]);

    return {
      data: rows,
      pagination: {
        total: totalResult[0]?.total ?? 0,
        page,
        limit,
        totalPages: Math.ceil((totalResult[0]?.total ?? 0) / limit),
      }
    };
  }

  /**
   * Fetches a single transaction by ID with full relations.
   */
  static async getTransactionById(id: string, tenantId: string) {
    const tx = await db.query.transactions.findFirst({
      where: and(eq(transactions.id, id), eq(transactions.tenantId, tenantId)),
      with: {
        wallet: {
          with: {
            consumer: true
          }
        }
      }
    });

    if (!tx) throw new Error("Transaction not found");
    return tx;
  }
}
