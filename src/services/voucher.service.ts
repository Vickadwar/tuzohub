import { db } from "../db";
import { voucherBatches, vouchers, products, consumers, campaigns } from "../db/schema";
import { eq, and, desc, count, ilike, or } from "drizzle-orm";
import * as crypto from "crypto";
import { FraudService } from "./fraud.service";

export class VoucherService {
  /**
   * Generates a new batch of vouchers.
   */
  static async generateBatch(params: {
    tenantId: string;
    productId?: string;
    campaignId?: string;
    batchNumber: string;
    quantity: number;
    expiryDate?: Date;
  }) {
    const [batch] = await db
      .insert(voucherBatches)
      .values({
        ...params,
        generated: 0,
        isActivated: false,
        metadata: { status: "PRINTED" },
      })
      .returning();

    const voucherData = [];
    for (let i = 0; i < params.quantity; i++) {
      const serialNumber = this.generateSerialNumber(params.batchNumber, i);
      const secureCode = this.generateSecureCode();
      const secureCodeHash = crypto.createHash("sha256").update(secureCode).digest("hex");

      voucherData.push({
        batchId: batch.id,
        serialNumber,
        secureCodeHash,
        status: "PRINTED" as any,
      });
    }

    await db.insert(vouchers).values(voucherData);
    
    await db.update(voucherBatches)
        .set({ generated: params.quantity })
        .where(eq(voucherBatches.id, batch.id));

    return { batch, vouchers: voucherData.length };
  }

  /**
   * Lists voucher batches.
   */
  static async listBatches(tenantId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const [rows, totalResult] = await Promise.all([
      db.select({
        id: voucherBatches.id,
        batchNumber: voucherBatches.batchNumber,
        quantity: voucherBatches.quantity,
        generated: voucherBatches.generated,
        isActivated: voucherBatches.isActivated,
        metadata: voucherBatches.metadata,
        createdAt: voucherBatches.createdAt,
        productName: products.name,
        productSku: products.sku,
      })
      .from(voucherBatches)
      .leftJoin(products, eq(voucherBatches.productId, products.id))
      .where(eq(voucherBatches.tenantId, tenantId))
      .orderBy(desc(voucherBatches.createdAt))
      .limit(limit)
      .offset(offset),
      db.select({ total: count() }).from(voucherBatches).where(eq(voucherBatches.tenantId, tenantId)),
    ]);

    const total = totalResult[0]?.total ?? 0;

    return {
      data: rows.map(r => ({
        ...r,
        status: r.isActivated ? "ACTIVE" : ((r.metadata as any)?.status || "PRINTED"),
      })),
      pagination: { total, page, limit }
    };
  }

  /**
   * Lists individual vouchers, optionally filtered by batch or status.
   */
  static async listVouchers(params: {
    tenantId: string;
    batchId?: string;
    status?: string;
    page: number;
    limit: number;
  }) {
    const { tenantId, batchId, status, page, limit } = params;
    const offset = (page - 1) * limit;

    const baseQuery = db
      .select({
        id: vouchers.id,
        serialNumber: vouchers.serialNumber,
        status: vouchers.status,
        redeemedAt: vouchers.redeemedAt,
        createdAt: vouchers.createdAt,
        batchId: vouchers.batchId,
        batchNumber: voucherBatches.batchNumber,
        isActivated: voucherBatches.isActivated,
        productName: products.name,
      })
      .from(vouchers)
      .innerJoin(voucherBatches, eq(vouchers.batchId, voucherBatches.id))
      .leftJoin(products, eq(voucherBatches.productId, products.id));

    const filterConditions = [eq(voucherBatches.tenantId, tenantId)];
    if (batchId)  filterConditions.push(eq(vouchers.batchId, batchId));
    if (status)   filterConditions.push(eq(vouchers.status, status as any));
    const where = and(...filterConditions);

    const [rows, totalResult] = await Promise.all([
      baseQuery.where(where).orderBy(desc(vouchers.createdAt)).limit(limit).offset(offset),
      db.select({ total: count() })
        .from(vouchers)
        .innerJoin(voucherBatches, eq(vouchers.batchId, voucherBatches.id))
        .where(where),
    ]);

    return { data: rows, pagination: { total: totalResult[0]?.total ?? 0, page, limit } };
  }

  /**
   * Fetches a single voucher with full detail: batch, product, campaign, and consumer info.
   */
  static async getVoucher(id: string, tenantId: string) {
    const row = await db.select({
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
      isActivated: voucherBatches.isActivated,
      activatedAt: voucherBatches.activatedAt,
      expiryDate: voucherBatches.expiryDate,
      productId: voucherBatches.productId,
      productName: products.name,
      productSku: products.sku,
      campaignId: voucherBatches.campaignId,
      campaignName: campaigns.name,
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

    // If redeemed, try to fetch the MPesa reference from the matching redemptionsQueue item
    const voucherData = row[0] || null;
    if (voucherData && voucherData.status === "REDEEMED" && voucherData.redeemedBy) {
      try {
        const { redemptionsQueue } = await import("../db/schema");
        const { desc } = await import("drizzle-orm");
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

    return voucherData;
  }

  /**
   * Activates a batch of vouchers.
   */
  static async activateBatch(id: string, tenantId: string, userId: string) {
    const { sql } = await import("drizzle-orm");
    const [batch] = await db
      .update(voucherBatches)
      .set({ 
        isActivated: true, 
        activatedAt: new Date(),
        activatedBy: userId,
        metadata: sql`jsonb_set(COALESCE(metadata, '{}'::jsonb), '{status}', '"ACTIVE"'::jsonb, true)`
      })
      .where(and(eq(voucherBatches.id, id), eq(voucherBatches.tenantId, tenantId)))
      .returning();

    if (!batch) throw new Error("Batch not found or unauthorized");

    // Update all vouchers in the batch to ACTIVE
    await db.update(vouchers)
        .set({ status: "ACTIVE" as any })
        .where(eq(vouchers.batchId, id));

    return batch;
  }

  /**
   * Updates the status of a batch and all its underlying vouchers.
   */
  static async updateBatchStatus(id: string, tenantId: string, status: string) {
    const { sql } = await import("drizzle-orm");
    const [batch] = await db
      .update(voucherBatches)
      .set({ 
        metadata: sql`jsonb_set(COALESCE(metadata, '{}'::jsonb), '{status}', ${`"${status}"`}::jsonb, true)`
      })
      .where(and(eq(voucherBatches.id, id), eq(voucherBatches.tenantId, tenantId)))
      .returning();

    if (!batch) throw new Error("Batch not found or unauthorized");

    await db.update(vouchers)
        .set({ status: status as any })
        .where(and(eq(vouchers.batchId, id), or(eq(vouchers.status, "PRINTED"), eq(vouchers.status, "IN_TRANSIT"))));

    return batch;
  }

  // --- Helpers ---

  /**
   * Generates a human-readable serial number tied to the batch.
   * Format: BATCHREF-XXXX  e.g. B2026X1-0001
   */
  private static generateSerialNumber(batchNumber: string, index: number): string {
    const cleanBatch = batchNumber.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 8);
    const seq = String(index + 1).padStart(4, "0");
    return `${cleanBatch}-${seq}`;
  }

  /**
   * Generates a 10-character scratch code.
   * Alphabet deliberately excludes look-alike characters:
   *   Removed: 0 O o   (zero vs letter O)
   *   Removed: 1 l L I  (one vs lowercase L vs capital I)
   *   Removed: 5 S s   (five vs S)
   *   Removed: 2 Z z   (two vs Z)
   *   Removed: 6 G g   (six vs G)
   *   Removed: 8 B      (eight vs B)
   * Remaining 31 characters are easy to read and type.
   */
  private static generateSecureCode(): string {
    const ALPHABET = "3479ACDEFHJKMNPQRTVWXY";
    const crypto = require("crypto");
    let code = "";
    const bytes = crypto.randomBytes(10);
    for (let i = 0; i < 10; i++) {
      code += ALPHABET[bytes[i] % ALPHABET.length];
    }
    // Format as XXXXX-XXXXX for readability on a scratch card
    return `${code.slice(0, 5)}-${code.slice(5)}`;
  }
}
