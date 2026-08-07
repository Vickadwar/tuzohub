import { db } from "../db";
import { productBatches, products, voucherBatches, vouchers } from "../db/schema";
import { eq, and, desc, count, ilike, or, inArray, isNull, isNotNull, sql } from "drizzle-orm";
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
      // 1. Insert production batch record first to get ID
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
            campaignId: params.campaignId || null,
            createdAt: new Date().toISOString(),
          },
        })
        .returning();

      let activatedVouchersCount = 0;

      // 2. If voucherBatchIds are provided, sequentially allocate UNALLOCATED cards to this production batch
      if (params.voucherBatchIds && params.voucherBatchIds.length > 0) {
        let remainingTinsToAllocate = params.quantityProduced;

        for (const vbId of params.voucherBatchIds) {
          if (remainingTinsToAllocate <= 0) break;

          // Query cards in this voucher batch that have NOT been allocated to any production run yet
          const unallocatedCards = await tx
            .select({ id: vouchers.id, serialNumber: vouchers.serialNumber })
            .from(vouchers)
            .where(
              and(
                eq(vouchers.batchId, vbId),
                isNull(vouchers.productBatchId),
                sql`status != 'REDEEMED'`
              )
            )
            .orderBy(vouchers.serialNumber);

          const cardsToAllocate = unallocatedCards.slice(0, remainingTinsToAllocate);

          if (cardsToAllocate.length > 0) {
            const cardIdsToAllocate = cardsToAllocate.map((c) => c.id);

            // Assign cards to this production run and set status to ACTIVE
            await tx
              .update(vouchers)
              .set({
                productBatchId: batch.id,
                status: "ACTIVE" as any,
              })
              .where(inArray(vouchers.id, cardIdsToAllocate));

            activatedVouchersCount += cardsToAllocate.length;
            remainingTinsToAllocate -= cardsToAllocate.length;
          }

          // Check if all vouchers in the parent batch have been allocated
          const [unallocatedCount] = await tx
            .select({ count: count() })
            .from(vouchers)
            .where(and(eq(vouchers.batchId, vbId), isNull(vouchers.productBatchId)));

          const isFullyAllocated = (unallocatedCount?.count ?? 0) === 0;

          await tx
            .update(voucherBatches)
            .set({
              productId: params.productId,
              campaignId: params.campaignId || null,
              isActivated: isFullyAllocated,
              activatedAt: isFullyAllocated ? new Date() : undefined,
              activatedBy: params.userId || null,
              metadata: sql`jsonb_set(COALESCE(metadata, '{}'::jsonb), '{status}', ${
                isFullyAllocated ? '"ACTIVE"' : '"IN_STOCK"'
              }::jsonb)`,
            })
            .where(and(eq(voucherBatches.id, vbId), eq(voucherBatches.tenantId, params.tenantId)));
        }
      }

      // Update metadata on batch record with actual allocated count
      const updatedMetadata = {
        ...(batch.metadata as any),
        activatedVouchersCount,
      };

      await tx
        .update(productBatches)
        .set({ metadata: updatedMetadata })
        .where(eq(productBatches.id, batch.id));

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
        metadata: updatedMetadata,
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
   * Gets a single production batch by ID with deep telemetry & paginated allocated vouchers.
   */
  static async getBatch(id: string, tenantId: string, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const batch = await db.query.productBatches.findFirst({
      where: and(eq(productBatches.id, id), eq(productBatches.tenantId, tenantId)),
      with: {
        product: true,
      },
    });

    if (!batch) throw new Error("Batch not found or unauthorized");

    // Fetch exact vouchers allocated to this specific production run
    const [allocatedVouchers, [totalVouchersCount]] = await Promise.all([
      db
        .select({
          id: vouchers.id,
          serialNumber: vouchers.serialNumber,
          status: vouchers.status,
          redeemedAt: vouchers.redeemedAt,
          createdAt: vouchers.createdAt,
          batchNumber: voucherBatches.batchNumber,
        })
        .from(vouchers)
        .leftJoin(voucherBatches, eq(vouchers.batchId, voucherBatches.id))
        .where(eq(vouchers.productBatchId, id))
        .orderBy(vouchers.serialNumber)
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(vouchers).where(eq(vouchers.productBatchId, id)),
    ]);

    const meta = (batch.metadata as any) || {};
    const voucherBatchIds: string[] = meta.voucherBatchIds || [];

    let linkedBatches: any[] = [];
    if (voucherBatchIds.length > 0) {
      const rawBatches = await db
        .select({
          id: voucherBatches.id,
          batchNumber: voucherBatches.batchNumber,
          quantity: voucherBatches.quantity,
          generated: voucherBatches.generated,
          isActivated: voucherBatches.isActivated,
        })
        .from(voucherBatches)
        .where(inArray(voucherBatches.id, voucherBatchIds));

      linkedBatches = await Promise.all(
        rawBatches.map(async (b) => {
          const [thisRunRes] = await db
            .select({ count: count() })
            .from(vouchers)
            .where(and(eq(vouchers.batchId, b.id), eq(vouchers.productBatchId, id)));

          const [totalConsumedRes] = await db
            .select({ count: count() })
            .from(vouchers)
            .where(and(eq(vouchers.batchId, b.id), isNotNull(vouchers.productBatchId)));

          const originalQuantity = b.quantity || 0;
          const consumedByThisRun = thisRunRes?.count || 0;
          const consumedTotal = totalConsumedRes?.count || 0;
          const remainingBalance = Math.max(0, originalQuantity - consumedTotal);

          return {
            ...b,
            originalQuantity,
            consumedByThisRun,
            consumedTotal,
            remainingBalance,
          };
        })
      );
    }

    const totalAllocated = totalVouchersCount?.count || 0;

    return {
      ...batch,
      linkedBatches,
      allocatedVouchers,
      allocatedVouchersCount: totalAllocated,
      pagination: {
        total: totalAllocated,
        page,
        limit,
        totalPages: Math.ceil(totalAllocated / limit) || 1,
      },
    };
  }
}
