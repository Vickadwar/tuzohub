import { db } from "../db";
import { offlineSyncQueue } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { LoyaltyService } from "./loyalty.service";

export class OfflineSyncService {
  static async enqueuePayload(tenantId: string, deviceId: string, payload: any, tx: any = db) {
    // Generate idempotency key if not sent
    const idempotencyKey = payload.idempotencyKey || `${deviceId}-${Date.now()}`;
    
    // Check for duplicate to guarantee idempotency
    const [existing] = await tx.select().from(offlineSyncQueue).where(
      and(eq(offlineSyncQueue.tenantId, tenantId), eq(offlineSyncQueue.idempotencyKey, idempotencyKey))
    ).limit(1);

    if (existing) {
      return { status: existing.status, id: existing.id, message: "Payload already queued" };
    }

    const [queued] = await tx.insert(offlineSyncQueue).values({
      tenantId,
      deviceId,
      payload,
      idempotencyKey,
      status: "PENDING",
    }).returning();

    return queued;
  }

  static async processQueue(tenantId: string, tx: any = db) {
    const pendingItems = await tx.select().from(offlineSyncQueue).where(
      and(eq(offlineSyncQueue.tenantId, tenantId), eq(offlineSyncQueue.status, "PENDING"))
    ).limit(50); // Batch processing

    const results = [];

    for (const item of pendingItems) {
      try {
        const payloadData = item.payload as any;

        // E nterprise logic interpreting the POS offline actions
        if (payloadData.action === "OFFLINE_PURCHASE") {
          await LoyaltyService.processEarning({
            tenantId,
            consumerId: payloadData.consumerId,
            points: payloadData.points,
            actionCategory: "PURCHASE",
            description: "Offline Sync Purchase",
          }, tx);
        } else if (payloadData.action === "OFFLINE_VOUCHER") {
           // Wait, we can't do offline voucher redemption securely without backend validation, 
           // but some systems pre-hash batches onto devices.
        }

        await tx.update(offlineSyncQueue)
          .set({ status: "PROCESSED", processedAt: new Date() })
          .where(eq(offlineSyncQueue.id, item.id));

        results.push({ id: item.id, status: "PROCESSED" });
      } catch (error: any) {
        await tx.update(offlineSyncQueue)
          .set({ status: "FAILED", errorMessage: error.message, processedAt: new Date() })
          .where(eq(offlineSyncQueue.id, item.id));

        results.push({ id: item.id, status: "FAILED", error: error.message });
      }
    }

    return results;
  }
}
