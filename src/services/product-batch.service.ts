import { db } from "../db";
import { productBatches, products } from "../db/schema";
import { eq, and, desc, count, ilike, or, inArray, sql } from "drizzle-orm";
import { AuditService } from "./audit.service";

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
      let activatedVouchersCount = 0;

      // 1. If voucherBatchIds are provided, handle partial or full card activation
      if (params.voucherBatchIds && params.voucherBatchIds.length > 0) {
        const { voucherBatches, vouchers } = require("../db/schema");

        let remainingTinsToAllocate = params.quantityProduced;

        for (const vbId of params.voucherBatchIds) {
          if (remainingTinsToAllocate <= 0) break;

          // Fetch cards in this batch that are not yet active
          const batchCards = await tx
            .select({ id: vouchers.id, serialNumber: vouchers.serialNumber })
            .from(vouchers)
            .where(and(eq(vouchers.batchId, vbId), eq(vouchers.status, "PRINTED")))
            .orderBy(vouchers.serialNumber);

          const cardsToActivate = batchCards.slice(0, remainingTinsToAllocate);

          if (cardsToActivate.length > 0) {
            const cardIdsToActivate = cardsToActivate.map((c) => c.id);

            await tx
              .update(vouchers)
              .set({ status: "ACTIVE" })
              .where(inArray(vouchers.id, cardIdsToActivate));

            activatedVouchersCount += cardsToActivate.length;
            remainingTinsToAllocate -= cardsToActivate.length;
          }

          // Check if all vouchers in the batch are activated now
          const [unactivatedCount] = await tx
            .select({ count: count() })
            .from(vouchers)
            .where(and(eq(vouchers.batchId, vbId), eq(vouchers.status, "PRINTED")));

          const isFullyActivated = (unactivatedCount?.count ?? 0) === 0;

          await tx
            .update(voucherBatches)
            .set({
              productId: params.productId,
              campaignId: params.campaignId || null,
              isActivated: isFullyActivated,
              activatedAt: isFullyActivated ? new Date() : undefined,
              activatedBy: params.userId || null,
              metadata: sql`jsonb_set(COALESCE(metadata, '{}'::jsonb), '{status}', ${
                isFullyActivated ? '"ACTIVE"' : '"IN_STOCK"'
              }::jsonb)`,
            })
            .where(and(eq(voucherBatches.id, vbId), eq(voucherBatches.tenantId, params.tenantId)));
        }
      }

      // 2. Create the production batch record
      const [batch] = await tx
        .insert(productBatches)
        .values({
          tenantId: params.tenantId,
          productId: params.productId,
          batchNumber: params.batchNumber.toUpperCase().trim(),
          quantityProduced: params.quantityProduced,
          productionDate: params.productionDate,
          expiryDate: params.expiryDate,
          quantityRemaining: params.quantityProduced,
          status: params.status || "active",
          metadata: {
            voucherBatchIds: params.voucherBatchIds || [],
            activatedVouchersCount,
            campaignId: params.campaignId || null,
            createdAt: new Date().toISOString(),
          },
        })
        .returning();

      // Log audit event outside transaction async
      AuditService.logEvent({
        tenantId: params.tenantId,
        userId: params.userId,
        action: "PRODUCTION_RUN_CREATED",
        entityType: "product_batch",
        entityId: batch.id,
        newData: {
          batchNumber: batch.batchNumber,
          quantityProduced: params.quantityProduced,
          activatedVouchersCount,
          voucherBatchIds: params.voucherBatchIds || [],
        },
      });

      return {
        ...batch,
        activatedVouchersCount,
      };
    });
  }

  /**
   * Lists production batches with rich metrics.
   */
  static async listBatches(tenantId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const [rows, totalResult] = await Promise.all([
      db
        .select({
          id: productBatches.id,
          batchNumber: productBatches.batchNumber,
          quantityProduced: productBatches.quantityProduced,
          quantityRemaining: productBatches.quantityRemaining,
          productionDate: productBatches.productionDate,
          status: productBatches.status,
          createdAt: productBatches.createdAt,
          metadata: productBatches.metadata,
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
      pagination: { total, page, limit },
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
   * Gets a single production batch by ID with deep telemetry & linked voucher details.
   */
  static async getBatch(id: string, tenantId: string) {
    const batch = await db.query.productBatches.findFirst({
      where: and(eq(productBatches.id, id), eq(productBatches.tenantId, tenantId)),
      with: {
        product: true,
      },
    });

    if (!batch) throw new Error("Batch not found or unauthorized");

    // Fetch linked voucher batches & card counts
    const meta = (batch.metadata as any) || {};
    const voucherBatchIds: string[] = meta.voucherBatchIds || [];

    let linkedBatches: any[] = [];
    if (voucherBatchIds.length > 0) {
      const { voucherBatches } = require("../db/schema");
      linkedBatches = await db
        .select({
          id: voucherBatches.id,
          batchNumber: voucherBatches.batchNumber,
          quantity: voucherBatches.quantity,
          status: voucherBatches.metadata,
          isActivated: voucherBatches.isActivated,
        })
        .from(voucherBatches)
        .where(inArray(voucherBatches.id, voucherBatchIds));
    }

    return {
      ...batch,
      linkedBatches,
      activatedVouchersCount: meta.activatedVouchersCount || 0,
    };
  }
}
