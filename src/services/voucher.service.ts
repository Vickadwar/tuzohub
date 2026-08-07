import { db } from "../db";
import { voucherBatches, vouchers, products, consumers, campaigns } from "../db/schema";
import { eq, and, desc, count, ilike, or, isNotNull, sql } from "drizzle-orm";
import * as crypto from "crypto";
import { AuditService } from "./audit.service";

export class VoucherService {
  /**
   * Generates a new batch of vouchers (Value-Based Pool or Product-Specific).
   * Returns metadata and unhashed secure codes for immediate factory CSV export.
   */
  /**
   * Generates a new batch of vouchers.
   * Uses chunked database inserts and deterministic HMAC scratch codes for fast, fault-tolerant generation.
   */
  static async generateBatch(params: {
    tenantId: string;
    productId?: string;
    campaignId?: string;
    batchNumber: string;
    quantity: number;
    expiryDate?: Date;
    batchType?: "VALUE_BASED" | "PRODUCT_SPECIFIC";
    rewardDenomination?: string | number;
    rewardType?: "MOBILE_MONEY" | "POINTS" | "AIRTIME";
  }) {
    const cleanBatchRef = params.batchNumber.toUpperCase().trim();
    const metaPayload = {
      status: "GENERATED",
      batchType: params.batchType || (params.productId ? "PRODUCT_SPECIFIC" : "VALUE_BASED"),
      rewardDenomination: params.rewardDenomination ? String(params.rewardDenomination) : "50.00",
      rewardType: params.rewardType || "MOBILE_MONEY",
    };

    const [batch] = await db
      .insert(voucherBatches)
      .values({
        tenantId: params.tenantId,
        productId: params.productId || null,
        campaignId: params.campaignId || null,
        batchNumber: cleanBatchRef,
        quantity: params.quantity,
        expiryDate: params.expiryDate || null,
        generated: 0,
        isActivated: false,
        metadata: metaPayload,
      })
      .returning();

    const voucherData = [];
    const secretKey = `${params.tenantId}:${cleanBatchRef}:${batch.id}`;

    for (let i = 0; i < params.quantity; i++) {
      const serialNumber = this.generateSerialNumber(cleanBatchRef, i);
      const secureCode = this.generateDeterministicCode(secretKey, serialNumber);
      const secureCodeHash = crypto.createHash("sha256").update(secureCode).digest("hex");

      voucherData.push({
        batchId: batch.id,
        serialNumber,
        secureCodeHash,
        status: "PRINTED" as any,
      });
    }

    // Chunk DB inserts (1,000 rows per query) with progressive generated count updates
    const chunkSize = 1000;
    let createdCount = 0;
    for (let i = 0; i < voucherData.length; i += chunkSize) {
      const chunk = voucherData.slice(i, i + chunkSize);
      await db.insert(vouchers).values(chunk).onConflictDoNothing();
      createdCount += chunk.length;

      // Update inventory generated count progressively
      await db
        .update(voucherBatches)
        .set({ generated: createdCount })
        .where(eq(voucherBatches.id, batch.id));
    }

    const [updatedBatch] = await db
      .select()
      .from(voucherBatches)
      .where(eq(voucherBatches.id, batch.id))
      .limit(1);

    await AuditService.logEvent({
      tenantId: params.tenantId,
      action: "VOUCHER_BATCH_CREATED",
      entityType: "voucher_batch",
      entityId: batch.id,
      newData: {
        batchNumber: batch.batchNumber,
        quantity: params.quantity,
        productId: params.productId || null,
        campaignId: params.campaignId || null,
      },
    });

    const exportRows = voucherData.map((v) => ({
      serialNumber: v.serialNumber,
      secureCode: this.generateDeterministicCode(secretKey, v.serialNumber),
      batchNumber: cleanBatchRef,
      productSku: "GENERIC",
    }));

    return {
      batch: updatedBatch || { ...batch, generated: createdCount },
      vouchersCount: voucherData.length,
      exportRows,
    };
  }

  /**
   * Generates a deterministic, cryptographically secure 10-char scratch code from a secret & serial number.
   */
  static generateDeterministicCode(secretKey: string, serialNumber: string): string {
    const rawHmac = crypto.createHmac("sha256", secretKey).update(serialNumber).digest("hex").toUpperCase();
    const part1 = rawHmac.substring(0, 5);
    const part2 = rawHmac.substring(5, 10);
    return `${part1}-${part2}`;
  }

  /**
   * Exports unhashed scratch codes for commercial printing presses.
   */
  static async exportBatchCSV(batchId: string, tenantId: string) {
    const [batch] = await db
      .select({
        id: voucherBatches.id,
        batchNumber: voucherBatches.batchNumber,
        tenantId: voucherBatches.tenantId,
        metadata: voucherBatches.metadata,
        isActivated: voucherBatches.isActivated,
        productSku: products.sku,
        productName: products.name,
      })
      .from(voucherBatches)
      .leftJoin(products, eq(voucherBatches.productId, products.id))
      .where(and(eq(voucherBatches.id, batchId), eq(voucherBatches.tenantId, tenantId)))
      .limit(1);

    if (!batch) throw new Error("Voucher batch not found or unauthorized");

    const meta = (batch.metadata as any) || {};
    const batchStatus = (batch as any).isActivated ? "ACTIVE" : (meta.status || "GENERATED");

    const cardRows = await db
      .select({
        serialNumber: vouchers.serialNumber,
      })
      .from(vouchers)
      .where(eq(vouchers.batchId, batchId))
      .orderBy(vouchers.serialNumber);

    if (!cardRows.length) {
      throw new Error("No vouchers found cataloged in this batch.");
    }

    const secretKey = `${batch.tenantId}:${batch.batchNumber}:${batch.id}`;

    await AuditService.logEvent({
      tenantId,
      action: "SECRET_MANIFEST_EXPORTED",
      entityType: "voucher_batch",
      entityId: batchId,
      newData: {
        batchNumber: batch.batchNumber,
        exportedCardsCount: cardRows.length,
      },
    });

    return cardRows.map((c) => {
      const secureCode = this.generateDeterministicCode(secretKey, c.serialNumber);
      return {
        serialNumber: c.serialNumber,
        secureCode,
        batchNumber: batch.batchNumber,
        productSku: batch.productSku || "GENERIC",
        productName: batch.productName || "Generic Pool",
      };
    });
  }

  /**
   * Lists voucher batches with rich metadata and linked product details.
   */
  static async listBatches(tenantId: string, page = 1, limit = 15) {
    const offset = (page - 1) * limit;

    const [rows, totalResult] = await Promise.all([
      db
        .select({
          id: voucherBatches.id,
          batchNumber: voucherBatches.batchNumber,
          quantity: voucherBatches.quantity,
          generated: voucherBatches.generated,
          isActivated: voucherBatches.isActivated,
          metadata: voucherBatches.metadata,
          createdAt: voucherBatches.createdAt,
          productId: voucherBatches.productId,
          productName: products.name,
          productSku: products.sku,
          campaignId: voucherBatches.campaignId,
          campaignName: campaigns.name,
        })
        .from(voucherBatches)
        .leftJoin(products, eq(voucherBatches.productId, products.id))
        .leftJoin(campaigns, eq(voucherBatches.campaignId, campaigns.id))
        .where(eq(voucherBatches.tenantId, tenantId))
        .orderBy(desc(voucherBatches.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(voucherBatches).where(eq(voucherBatches.tenantId, tenantId)),
    ]);

    const total = totalResult[0]?.total ?? 0;

    const data = await Promise.all(
      rows.map(async (r) => {
        const meta = (r.metadata as any) || {};
        const [allocatedRes] = await db
          .select({ count: count() })
          .from(vouchers)
          .where(and(eq(vouchers.batchId, r.id), isNotNull(vouchers.productBatchId)));

        const allocatedCount = allocatedRes?.count || 0;
        const originalQuantity = r.quantity || 0;
        const remainingBalance = Math.max(0, originalQuantity - allocatedCount);

        return {
          ...r,
          batchType: meta.batchType || (r.productId ? "PRODUCT_SPECIFIC" : "VALUE_BASED"),
          rewardDenomination: meta.rewardDenomination || "50.00",
          rewardType: meta.rewardType || "MOBILE_MONEY",
          status: r.isActivated ? "ACTIVE" : meta.status || "PRINTED",
          originalQuantity,
          allocatedCount,
          consumedCount: allocatedCount,
          remainingBalance,
          unallocatedCount: remainingBalance,
        };
      })
    );

    return {
      data,
      pagination: { total, page, limit },
    };
  }

  /**
   * Fetches details of a single voucher batch including product, campaign, status, and status counts.
   */
  static async getBatch(id: string, tenantId: string) {
    const row = await db
      .select({
        id: voucherBatches.id,
        batchNumber: voucherBatches.batchNumber,
        quantity: voucherBatches.quantity,
        generated: voucherBatches.generated,
        isActivated: voucherBatches.isActivated,
        activatedAt: voucherBatches.activatedAt,
        activatedBy: voucherBatches.activatedBy,
        metadata: voucherBatches.metadata,
        createdAt: voucherBatches.createdAt,
        updatedAt: voucherBatches.updatedAt,
        productId: voucherBatches.productId,
        productName: products.name,
        productSku: products.sku,
        productPoints: products.pointsPerUnit,
        campaignId: voucherBatches.campaignId,
        campaignName: campaigns.name,
      })
      .from(voucherBatches)
      .leftJoin(products, eq(voucherBatches.productId, products.id))
      .leftJoin(campaigns, eq(voucherBatches.campaignId, campaigns.id))
      .where(and(eq(voucherBatches.id, id), eq(voucherBatches.tenantId, tenantId)))
      .limit(1);

    const batch = row[0];
    if (!batch) return null;

    const statusCounts = await db
      .select({
        status: vouchers.status,
        total: count(),
      })
      .from(vouchers)
      .where(eq(vouchers.batchId, id))
      .groupBy(vouchers.status);

    const counts: Record<string, number> = {};
    statusCounts.forEach((s) => {
      counts[s.status] = s.total;
    });

    const meta = (batch.metadata as any) || {};

    return {
      ...batch,
      status: batch.isActivated ? "ACTIVE" : meta.status || "PRINTED",
      counts: {
        printed: counts["PRINTED"] || 0,
        inTransit: counts["IN_TRANSIT"] || 0,
        active: counts["ACTIVE"] || 0,
        redeemed: counts["REDEEMED"] || 0,
        cancelled: counts["CANCELLED"] || 0,
      },
    };
  }

  /**
   * Returns voucher analytics KPI summary.
   */
  static async getVoucherAnalytics(tenantId: string) {
    const batches = await db
      .select({
        id: voucherBatches.id,
        quantity: voucherBatches.quantity,
        isActivated: voucherBatches.isActivated,
        metadata: voucherBatches.metadata,
        pointsPerUnit: products.pointsPerUnit,
      })
      .from(voucherBatches)
      .leftJoin(products, eq(voucherBatches.productId, products.id))
      .where(eq(voucherBatches.tenantId, tenantId));

    const totalBatches = batches.length;
    let totalCardsGenerated = 0;
    let activeCardsInMarket = 0;
    let totalDenominationValue = 0;

    batches.forEach((b) => {
      const qty = b.quantity || 0;
      const meta = (b.metadata as any) || {};
      const denom = b.pointsPerUnit ? parseFloat(String(b.pointsPerUnit)) : (parseFloat(meta.rewardDenomination || "50.00") || 50);

      totalCardsGenerated += qty;
      totalDenominationValue += denom * qty;
      if (b.isActivated) {
        activeCardsInMarket += qty;
      }
    });

    const [redeemedRes] = await db
      .select({ total: count() })
      .from(vouchers)
      .innerJoin(voucherBatches, eq(vouchers.batchId, voucherBatches.id))
      .where(and(eq(voucherBatches.tenantId, tenantId), eq(vouchers.status, "REDEEMED")));

    const totalRedeemed = redeemedRes?.total ?? 0;
    const redemptionRate = totalCardsGenerated > 0 ? ((totalRedeemed / totalCardsGenerated) * 100).toFixed(1) : "0.0";

    return {
      totalBatches,
      totalCardsGenerated,
      activeCardsInMarket,
      totalRedeemed,
      redemptionRate,
      totalDenominationValue,
    };
  }

  /**
   * Lists individual vouchers with pagination & filters.
   */
  static async listVouchers(params: {
    tenantId: string;
    batchId?: string;
    status?: string;
    batchType?: string;
    page: number;
    limit: number;
  }) {
    const { tenantId, batchId, status, page, limit } = params;
    const offset = (page - 1) * limit;

    const filterConditions = [eq(voucherBatches.tenantId, tenantId)];
    if (batchId) filterConditions.push(eq(vouchers.batchId, batchId));
    if (status) {
      const upperStatus = status.toUpperCase().trim();
      if (upperStatus === "IN_STOCK") {
        filterConditions.push(
          or(
            sql`(${voucherBatches.metadata}->>'status' = 'IN_STOCK')`,
            eq(vouchers.status, "IN_TRANSIT" as any)
          )!
        );
      } else if (upperStatus === "ACTIVE") {
        filterConditions.push(
          or(
            eq(vouchers.status, "ACTIVE" as any),
            eq(voucherBatches.isActivated, true)
          )!
        );
      } else if (["PRINTED", "IN_TRANSIT", "REDEEMED", "CANCELLED", "EXPIRED"].includes(upperStatus)) {
        filterConditions.push(eq(vouchers.status, upperStatus as any));
      }
    }
    const where = and(...filterConditions);

    const [rows, totalResult] = await Promise.all([
      db
        .select({
          id: vouchers.id,
          serialNumber: vouchers.serialNumber,
          status: vouchers.status,
          redeemedAt: vouchers.redeemedAt,
          createdAt: vouchers.createdAt,
          batchId: vouchers.batchId,
          batchNumber: voucherBatches.batchNumber,
          isActivated: voucherBatches.isActivated,
          batchMetadata: voucherBatches.metadata,
          productId: voucherBatches.productId,
          productName: products.name,
          productPointsPerUnit: products.pointsPerUnit,
          campaignId: voucherBatches.campaignId,
          campaignName: campaigns.name,
          campaignPointsMultiplier: campaigns.pointsMultiplier,
        })
        .from(vouchers)
        .innerJoin(voucherBatches, eq(vouchers.batchId, voucherBatches.id))
        .leftJoin(products, eq(voucherBatches.productId, products.id))
        .leftJoin(campaigns, eq(voucherBatches.campaignId, campaigns.id))
        .where(where)
        .orderBy(desc(vouchers.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(vouchers)
        .innerJoin(voucherBatches, eq(vouchers.batchId, voucherBatches.id))
        .where(where),
    ]);

    const formattedRows = rows.map((r) => {
      const meta = (r.batchMetadata as any) || {};
      const batchStatus = r.isActivated ? "ACTIVE" : (meta.status || "PRINTED");
      const effectiveStatus = (r.status === "REDEEMED" || r.status === "ACTIVE") ? r.status : batchStatus;

      const basePoints = r.productPointsPerUnit !== null && r.productPointsPerUnit !== undefined
        ? parseFloat(String(r.productPointsPerUnit))
        : (parseFloat(String(meta.rewardDenomination || "50.00")) || 50.00);

      const multiplier = r.campaignPointsMultiplier !== null && r.campaignPointsMultiplier !== undefined
        ? parseFloat(String(r.campaignPointsMultiplier))
        : 1.0;

      const rewardDenomination = (basePoints * multiplier).toFixed(2);

      return {
        ...r,
        status: effectiveStatus,
        effectiveStatus,
        basePoints,
        campaignMultiplier: multiplier,
        rewardDenomination,
        rewardType: meta.rewardType || "MOBILE_MONEY",
        batchType: meta.batchType || (r.productName ? "PRODUCT_SPECIFIC" : "VALUE_BASED"),
      };
    });

    return { data: formattedRows, pagination: { total: totalResult[0]?.total ?? 0, page, limit } };
  }

  /**
   * Fetches a single voucher with full detail.
   */
  static async getVoucher(id: string, tenantId: string) {
    const row = await db
      .select({
        id: vouchers.id,
        serialNumber: vouchers.serialNumber,
        status: vouchers.status,
        redeemedAt: vouchers.redeemedAt,
        redeemedBy: vouchers.redeemedBy,
        createdAt: vouchers.createdAt,
        updatedAt: vouchers.updatedAt,
        batchId: vouchers.batchId,
        batchNumber: voucherBatches.batchNumber,
        batchCreatedAt: voucherBatches.createdAt,
        batchMetadata: voucherBatches.metadata,
        isActivated: voucherBatches.isActivated,
        activatedAt: voucherBatches.activatedAt,
        expiryDate: voucherBatches.expiryDate,
        productId: voucherBatches.productId,
        productName: products.name,
        productSku: products.sku,
        productPointsPerUnit: products.pointsPerUnit,
        campaignId: voucherBatches.campaignId,
        campaignName: campaigns.name,
        campaignPointsMultiplier: campaigns.pointsMultiplier,
        consumerFirstName: consumers.firstName,
        consumerLastName: consumers.lastName,
        consumerPhone: consumers.phoneNumber,
        consumerLoyaltyNumber: consumers.loyaltyNumber,
      })
      .from(vouchers)
      .innerJoin(voucherBatches, eq(vouchers.batchId, voucherBatches.id))
      .leftJoin(products, eq(voucherBatches.productId, products.id))
      .leftJoin(campaigns, eq(voucherBatches.campaignId, campaigns.id))
      .leftJoin(consumers, eq(vouchers.redeemedBy, consumers.id))
      .where(and(eq(vouchers.id, id), eq(voucherBatches.tenantId, tenantId)))
      .limit(1);

    const voucherData = row[0] || null;
    if (voucherData && voucherData.status === "REDEEMED" && voucherData.redeemedBy) {
      try {
        const { redemptionsQueue } = await import("../db/schema");
        const [queue] = await db
          .select({ mpesaRef: redemptionsQueue.externalReference })
          .from(redemptionsQueue)
          .where(eq(redemptionsQueue.consumerId, voucherData.redeemedBy))
          .orderBy(desc(redemptionsQueue.createdAt))
          .limit(1);

        if (queue && queue.mpesaRef) {
          (voucherData as any).mpesaRef = queue.mpesaRef;
        }
      } catch (e) {
        // ignore errors
      }
    }

    if (voucherData) {
      const meta = (voucherData.batchMetadata as any) || {};
      const batchStatus = voucherData.isActivated ? "ACTIVE" : (meta.status || "PRINTED");
      const effectiveStatus = (voucherData.status === "REDEEMED" || voucherData.status === "ACTIVE") ? voucherData.status : batchStatus;

      const basePoints = voucherData.productPointsPerUnit !== null && voucherData.productPointsPerUnit !== undefined
        ? parseFloat(String(voucherData.productPointsPerUnit))
        : (parseFloat(String(meta.rewardDenomination || "50.00")) || 50.00);

      const multiplier = voucherData.campaignPointsMultiplier !== null && voucherData.campaignPointsMultiplier !== undefined
        ? parseFloat(String(voucherData.campaignPointsMultiplier))
        : 1.0;

      const rewardDenomination = (basePoints * multiplier).toFixed(2);

      (voucherData as any).status = effectiveStatus;
      (voucherData as any).effectiveStatus = effectiveStatus;
      (voucherData as any).basePoints = basePoints;
      (voucherData as any).campaignMultiplier = multiplier;
      (voucherData as any).rewardDenomination = rewardDenomination;
      (voucherData as any).rewardType = meta.rewardType || "MOBILE_MONEY";
      (voucherData as any).batchType = meta.batchType || (voucherData.productId ? "PRODUCT_SPECIFIC" : "VALUE_BASED");
    }

    return voucherData;
  }

  /**
   * Rebinds a voucher batch to a specific Product or Campaign dynamically.
   */
  static async rebindBatch(id: string, tenantId: string, payload: { productId?: string; campaignId?: string }) {
    const updateData: any = {};
    if (payload.productId !== undefined) updateData.productId = payload.productId || null;
    if (payload.campaignId !== undefined) updateData.campaignId = payload.campaignId || null;

    const [batch] = await db
      .update(voucherBatches)
      .set(updateData)
      .where(and(eq(voucherBatches.id, id), eq(voucherBatches.tenantId, tenantId)))
      .returning();

    if (!batch) throw new Error("Batch not found or unauthorized");
    return batch;
  }

  /**
   * Activates a batch of vouchers upon production line packaging.
   */
  static async activateBatch(id: string, tenantId: string, userId: string) {
    const [batch] = await db
      .update(voucherBatches)
      .set({
        isActivated: true,
        activatedAt: new Date(),
        activatedBy: userId,
        metadata: sql`jsonb_set(COALESCE(metadata, '{}'::jsonb), '{status}', '"ACTIVE"'::jsonb, true)`,
      })
      .where(and(eq(voucherBatches.id, id), eq(voucherBatches.tenantId, tenantId)))
      .returning();

    if (!batch) throw new Error("Batch not found or unauthorized");

    await db
      .update(vouchers)
      .set({ status: "ACTIVE" as any })
      .where(eq(vouchers.batchId, id));

    await AuditService.logEvent({
      tenantId,
      userId,
      action: "VOUCHER_BATCH_ACTIVATED",
      entityType: "voucher_batch",
      entityId: id,
      newData: { batchNumber: batch.batchNumber },
    });

    return batch;
  }

  /**
   * Updates batch status (e.g. GENERATED -> AT_PRINTER -> IN_TRANSIT -> IN_STOCK).
   */
  static async updateBatchStatus(id: string, tenantId: string, status: string) {
    const [batch] = await db
      .update(voucherBatches)
      .set({
        metadata: sql`jsonb_set(COALESCE(metadata, '{}'::jsonb), '{status}', ${`"${status}"`}::jsonb, true)`,
        updatedAt: new Date(),
      })
      .where(and(eq(voucherBatches.id, id), eq(voucherBatches.tenantId, tenantId)))
      .returning();

    if (!batch) throw new Error("Batch not found or unauthorized");

    let targetVoucherStatus: "PRINTED" | "IN_TRANSIT" | "ACTIVE" = "PRINTED";
    if (status === "IN_TRANSIT") targetVoucherStatus = "IN_TRANSIT";
    if (status === "ACTIVE") targetVoucherStatus = "ACTIVE";

    await db
      .update(vouchers)
      .set({ status: targetVoucherStatus })
      .where(and(eq(vouchers.batchId, id), sql`status != 'REDEEMED'`));

    await AuditService.logEvent({
      tenantId,
      action: "VOUCHER_BATCH_STATUS_UPDATED",
      entityType: "voucher_batch",
      entityId: id,
      newData: { newStatus: status, batchNumber: batch.batchNumber },
    });

    return batch;
  }

  /**
   * Deletes an unutilized voucher batch if no vouchers have been redeemed.
   */
  static async deleteBatch(id: string, tenantId: string, userId?: string) {
    const [batch] = await db
      .select()
      .from(voucherBatches)
      .where(and(eq(voucherBatches.id, id), eq(voucherBatches.tenantId, tenantId)))
      .limit(1);

    if (!batch) throw new Error("Voucher batch not found or unauthorized");

    // Check if any vouchers in this batch have been redeemed or claimed
    const [redeemedCountResult] = await db
      .select({ count: count() })
      .from(vouchers)
      .where(and(eq(vouchers.batchId, id), eq(vouchers.status, "REDEEMED" as any)));

    const redeemedCount = redeemedCountResult?.count || 0;
    if (redeemedCount > 0) {
      throw new Error(
        `Cannot delete batch "${batch.batchNumber}" because ${redeemedCount} card(s) have already been redeemed by consumers.`
      );
    }

    // Delete associated vouchers first
    await db.delete(vouchers).where(eq(vouchers.batchId, id));

    // Delete the batch record
    const [deletedBatch] = await db
      .delete(voucherBatches)
      .where(and(eq(voucherBatches.id, id), eq(voucherBatches.tenantId, tenantId)))
      .returning();

    await AuditService.logEvent({
      tenantId,
      userId,
      action: "VOUCHER_BATCH_DELETED",
      entityType: "voucher_batch",
      entityId: id,
      newData: { batchNumber: batch.batchNumber, quantity: batch.quantity },
    });

    return deletedBatch;
  }

  // --- Private Helpers ---

  private static generateSerialNumber(batchNumber: string, index: number): string {
    const cleanBatch = batchNumber.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 8);
    const seq = String(index + 1).padStart(4, "0");
    return `${cleanBatch}-${seq}`;
  }

  private static generateSecureCode(): string {
    const ALPHABET = "3479ACDEFHJKMNPQRTVWXY";
    let code = "";
    const bytes = crypto.randomBytes(10);
    for (let i = 0; i < 10; i++) {
      code += ALPHABET[bytes[i] % ALPHABET.length];
    }
    return `${code.slice(0, 5)}-${code.slice(5)}`;
  }
}
