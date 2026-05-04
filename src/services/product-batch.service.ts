import { db } from "../db";
import { productBatches, products } from "../db/schema";
import { eq, and, desc, count, ilike, or, inArray, sql } from "drizzle-orm";

export class ProductBatchService {
  static async createBatch(params: {
    tenantId: string;
    productId: string;
    batchNumber: string;
    quantityProduced: number;
    productionDate: Date;
    expiryDate?: Date;
    status?: string;
    voucherBatchIds?: string[];
    campaignId?: string;
    userId?: string;
  }) {
    return await db.transaction(async (tx) => {
      // 1. Create the production batch
      const [batch] = await tx
        .insert(productBatches)
        .values({
          tenantId: params.tenantId,
          productId: params.productId,
          batchNumber: params.batchNumber,
          quantityProduced: params.quantityProduced,
          productionDate: params.productionDate,
          expiryDate: params.expiryDate,
          quantityRemaining: params.quantityProduced,
          status: params.status || "active",
        })
        .returning();

      // 2. If voucherBatchIds were inserted, link & activate them
      if (params.voucherBatchIds && params.voucherBatchIds.length > 0) {
        const { voucherBatches, vouchers } = require("../db/schema");

        // Link the product/campaign to the voucher batches and mark them activated, injecting production reference
        await tx.update(voucherBatches)
          .set({ 
            productId: params.productId,
            campaignId: params.campaignId || null,
            isActivated: true,
            activatedAt: new Date(),
            activatedBy: params.userId || null,
            metadata: sql`jsonb_set(jsonb_set(COALESCE(metadata, '{}'::jsonb), '{status}', '"ACTIVE"'), '{productionBatchRef}', ${`"${params.batchNumber}"`}::jsonb)`
          })
          .where(and(
            inArray(voucherBatches.id, params.voucherBatchIds), 
            eq(voucherBatches.tenantId, params.tenantId)
          ));

        // Activate all individual vouchers inside those batches
        await tx.update(vouchers)
          .set({ status: "ACTIVE" })
          .where(inArray(vouchers.batchId, params.voucherBatchIds));
      }

      return batch;
    });
  }

  /**
   * Lists production batches.
   */
  static async listBatches(tenantId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const [rows, totalResult] = await Promise.all([
      db.select({
        id: productBatches.id,
        batchNumber: productBatches.batchNumber,
        quantityProduced: productBatches.quantityProduced,
        quantityRemaining: productBatches.quantityRemaining,
        productionDate: productBatches.productionDate,
        status: productBatches.status,
        createdAt: productBatches.createdAt,
        productName: products.name,
        productSku: products.sku,
      })
      .from(productBatches)
      .leftJoin(products, eq(productBatches.productId, products.id))
      .where(eq(productBatches.tenantId, tenantId))
      .orderBy(desc(productBatches.productionDate))
      .limit(limit)
      .offset(offset),
      db.select({ total: count() }).from(productBatches).where(eq(productBatches.tenantId, tenantId)),
    ]);

    const total = totalResult[0]?.total ?? 0;

    return {
      data: rows,
      pagination: { total, page, limit }
    };
  }

  /**
   * Updates batch status.
   */
  static async updateStatus(id: string, tenantId: string, status: string) {
    const [batch] = await db
      .update(productBatches)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(productBatches.id, id), eq(productBatches.tenantId, tenantId)))
      .returning();

    if (!batch) throw new Error("Batch not found or unauthorized");
    return batch;
  }

  /**
   * Gets a single batch by ID.
   */
  static async getBatch(id: string, tenantId: string) {
    const batch = await db.query.productBatches.findFirst({
      where: and(eq(productBatches.id, id), eq(productBatches.tenantId, tenantId)),
      with: {
        product: true
      }
    });

    if (!batch) throw new Error("Batch not found or unauthorized");
    return batch;
  }
}
