import { db } from "../db";
import { consumers, wallets, transactions, vouchers, pointLots, towns, tenantTiers, campaigns, tenantSettings } from "../db/schema";
import { eq, desc, and, or, ilike, sql, count, asc } from "drizzle-orm";

export class ConsumerService {
  /**
   * Searches for consumers by name or phone number
   */
  static async searchConsumers(tenantId: string, query: string, tx: any = db) {
    return await tx.query.consumers.findMany({
      where: and(
        eq(consumers.tenantId, tenantId),
        or(
          ilike(consumers.phoneNumber, `%${query}%`),
          ilike(consumers.firstName, `%${query}%`),
          ilike(consumers.lastName, `%${query}%`),
          ilike(consumers.loyaltyNumber, `%${query}%`),
          ilike(consumers.idNumber, `%${query}%`)
        )
      ),
      limit: 10,
      with: {
        loyaltyTier: true,
      }
    });
  }

  /**
   * Lists all consumers for a tenant
   */
  static async listConsumers(tenantId: string, tx: any = db) {
    return await tx.query.consumers.findMany({
      where: eq(consumers.tenantId, tenantId),
      with: {
        loyaltyTier: true,
      },
      orderBy: [desc(consumers.createdAt)],
    });
  }

  /**
   * Creates a new consumer with an auto-generated loyalty number
   */
  static async createConsumer(tenantId: string, data: any, tx: any = db) {
    // Generate 8-digit random loyalty number
    const loyaltyNumber = Math.floor(10000000 + Math.random() * 90000000).toString();

    const [newConsumer] = await tx.insert(consumers).values({
      tenantId,
      loyaltyNumber,
      phoneNumber: data.phoneNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      secondName: data.secondName,
      email: data.email,
      idNumber: data.idNumber,
      taxPin: data.taxPin,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      townId: data.townId,
      consumerType: data.consumerType || "END_USER",
      onboardedByAgentId: data.onboardedByAgentId,
      physicalTagId: data.physicalTagId,
      referredBy: data.referredBy,
      referralCode: `REF-${loyaltyNumber}`,
      status: "active",
      isRegistered: data.isRegistered ?? true,
      canPurchase: true,
      canEarnPoints: true,
      canRedeemPoints: true,
      canBankPoints: true,
    }).returning();

    // Initialize wallet
    await tx.insert(wallets).values({
      tenantId,
      ownerId: newConsumer.id,
      ownerType: "CONSUMER",
      pointsBalance: "0",
      bankedPointsBalance: "0",
    });

    return newConsumer;
  }

  /**
   * Updates a consumer profile
   */
  static async updateProfile(consumerId: string, data: any, tx: any = db) {
    // Sanitize data: convert empty strings to null for optional/UUID fields
    const sanitizedData = { ...data };
    for (const key in sanitizedData) {
      if (sanitizedData[key] === "") {
        sanitizedData[key] = null;
      }
    }

    const [updated] = await tx
      .update(consumers)
      .set({
        ...sanitizedData,
        updatedAt: new Date(),
      })
      .where(eq(consumers.id, consumerId))
      .returning();
    return updated;
  }

  /**
   * Updates granular redemption and banking controls
   */
  static async updateControls(consumerId: string, controls: any, tx: any = db) {
    const [updated] = await tx
      .update(consumers)
      .set({
        ...controls,
        updatedAt: new Date(),
      })
      .where(eq(consumers.id, consumerId))
      .returning();
    return updated;
  }

  /**
   * Sets or resets the USSD PIN
   */
  static async setUssdPin(consumerId: string, pin: string, tx: any = db) {
    // Simple SHA256 hash for demo (In production use bcrypt/argon2)
    const crypto = await import("crypto");
    const hash = crypto.createHash("sha256").update(pin).digest("hex");

    await tx
      .update(consumers)
      .set({
        ussdPinHash: hash,
        updatedAt: new Date(),
      })
      .where(eq(consumers.id, consumerId));
    
    return { success: true };
  }

  /**
   * Manages consumer status (Active, Suspended, Blocked)
   */
  static async setStatus(consumerId: string, status: "active" | "suspended" | "blocked", reason?: string, tx: any = db) {
    await tx
      .update(consumers)
      .set({
        status,
        redemptionBlockedReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(consumers.id, consumerId));
    
    return { success: true };
  }

  /**
   * Fetches detailed consumer profile including loyalty tier information
   */
  static async getProfile(consumerId: string, tx: any = db) {
    return await tx.query.consumers.findFirst({
      where: eq(consumers.id, consumerId),
      with: {
        loyaltyTier: true,
        town: true,
      },
    });
  }

  /**
   * Fetches the consumer's loyalty dashboard data with a unified activity log
   */
  static async getDashboard(
    tenantId: string, 
    consumerId: string, 
    options: { page?: number; limit?: number; earningPage?: number; redemptionPage?: number } = {},
    tx: any = db
  ) {
    const { page = 1, limit = 10 } = options;

    // 1. Get Wallet
    const wallet = await tx.query.wallets.findFirst({
      where: and(
        eq(wallets.tenantId, tenantId),
        eq(wallets.ownerId, consumerId),
        eq(wallets.ownerType, "CONSUMER")
      ),
    });

    if (!wallet) throw new Error("Wallet not found");

    // 2. Unified Activity Log (both CREDIT and DEBIT)
    const activityWhere = and(
      eq(transactions.tenantId, tenantId),
      eq(transactions.walletId, wallet.id)
    );
    const activityData = await tx.query.transactions.findMany({
      where: activityWhere,
      orderBy: [desc(transactions.createdAt)],
      limit,
      offset: (page - 1) * limit,
    });
    const [activityCount] = await tx.select({ total: count() }).from(transactions).where(activityWhere);

    // 3. Analytics: purchase frequency and top products
    const allTransactions = await tx.query.transactions.findMany({
      where: activityWhere,
      orderBy: [desc(transactions.createdAt)],
    });

    // Grouping Logic for Dashboard UI (Voucher Redemption Journeys)
    const groupedActivity: any[] = [];
    const serialMap = new Map();

    for (const tx of activityData) {
      const meta = tx.metadata as any || {};
      const serial = meta.voucherSerialNumber;

      if (serial) {
        if (!serialMap.has(serial)) {
          // Initialize group
          const entry = { ...tx, journeyComplete: false, mpesaRef: null };
          serialMap.set(serial, entry);
          groupedActivity.push(entry);
        } else {
          // Merge into existing group
          const existing = serialMap.get(serial);
          if (meta.mpesaRef) existing.mpesaRef = meta.mpesaRef;
          if (tx.accountingEntry === "DEBIT") existing.journeyComplete = true;
          // Keep the earliest timestamp if needed, but usually CREDIT is first
        }
      } else {
        groupedActivity.push({ ...tx, journeyComplete: true });
      }
    }

    // Compute purchase frequency (Success journeys per month)
    const successJourneys = allTransactions.filter((t: any) => t.accountingEntry === "CREDIT");
    let purchaseFrequency = "0";
    if (successJourneys.length > 1) {
      const first = new Date(successJourneys[successJourneys.length - 1].createdAt).getTime();
      const last = new Date(successJourneys[0].createdAt).getTime();
      const months = Math.max(1, (last - first) / (1000 * 60 * 60 * 24 * 30));
      purchaseFrequency = (successJourneys.length / months).toFixed(1);
    } else if (successJourneys.length === 1) {
      purchaseFrequency = "1";
    }

    // Compute top products from metadata - only count CREDIT (earning) transactions
    const productCounts: Record<string, { name: string; count: number; totalPoints: number }> = {};
    for (const tx of allTransactions.filter((t: any) => t.accountingEntry === 'CREDIT')) {
      const meta = tx.metadata as any;
      const productName = meta?.productName || tx.description || "Unknown";
      if (!productCounts[productName]) {
        productCounts[productName] = { name: productName, count: 0, totalPoints: 0 };
      }
      productCounts[productName].count += 1;
      productCounts[productName].totalPoints += parseFloat(tx.pointsAmount || "0");
    }
    const topProducts = Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 4. Get Consumer, Tier, and Tenant Settings
    const [consumerData, tSettingsRecord] = await Promise.all([
      this.getProfile(consumerId, tx),
      tx.query.tenantSettings.findFirst({
        where: eq(tenantSettings.tenantId, tenantId),
      }).catch(() => null),
    ]);

    return {
      wallet: {
        id: wallet.id,
        pointsBalance: wallet.pointsBalance,
        bankedPointsBalance: wallet.bankedPointsBalance,
        lifetimePointsEarned: wallet.lifetimePointsEarned,
      },
      consumer: consumerData,
      tenantSettings: tSettingsRecord,
      activity: {
        data: groupedActivity,
        total: activityCount.total,
        page,
      },
      analytics: {
        purchaseFrequency,
        topProducts,
        totalTransactions: successJourneys.length,
      },
    };
  }

  static async getActivityJourney(tenantId: string, consumerId: string, identifier: string, tx: any = db) {
    // 1. Fetch transactions by voucherSerialNumber or transaction ID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    const wallet = await tx.query.wallets.findFirst({ 
      where: and(eq(wallets.tenantId, tenantId), eq(wallets.ownerId, consumerId)) 
    });

    if (!wallet) throw new Error("Wallet not found for this consumer");

    const journeyTransactions = await tx.query.transactions.findMany({
      where: and(
        eq(transactions.tenantId, tenantId),
        eq(transactions.walletId, wallet.id),
        or(
          isUuid ? eq(transactions.id, identifier) : sql`false`,
          sql`metadata->>'voucherSerialNumber' = ${identifier}`
        )
      ),
      orderBy: [asc(transactions.createdAt)],
    });

    if (journeyTransactions.length === 0) return null;

    // 2. Extract metadata
    const mainTx = journeyTransactions.find((t: any) => t.accountingEntry === "CREDIT") || journeyTransactions[0];
    const meta = (mainTx.metadata || {}) as any;
    const serial = meta.voucherSerialNumber;

    // 3. Fetch Voucher/Product details if it's a voucher redemption
    let voucherData = null;
    if (serial) {
      voucherData = await tx.query.vouchers.findFirst({
        where: eq(vouchers.serialNumber, serial),
        with: {
          batch: {
            with: {
              product: true
            }
          }
        }
      });
    }

    return {
      transactions: journeyTransactions,
      voucher: voucherData,
      metadata: meta,
      isVoucherRedemption: !!serial,
    };
  }
}
