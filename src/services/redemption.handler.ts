import { db } from "../db";
import { redemptionsQueue } from "../db/schema";
import { eq, and, sql, lt } from "drizzle-orm";
import { PayoutProvider, WebhookPayoutProvider } from "./payout.gateway";

export class RedemptionHandler {
  private provider: PayoutProvider;

  constructor(provider: PayoutProvider = new WebhookPayoutProvider()) {
    this.provider = provider;
  }

  /**
   * Main entry point to process a batch of pending redemptions.
   * Can be called by a cron job or background worker.
   */
  async processPending(limit = 10, database = db) {
    const pending = await database.query.redemptionsQueue.findMany({
      where: and(
        eq(redemptionsQueue.status, "PENDING"),
        lt(redemptionsQueue.retryCount, 3) // Only retry up to 3 times
      ),
      limit: limit,
    });

    console.log(`[RedemptionHandler] Found ${pending.length} pending redemptions to process.`);

    for (const item of pending) {
      await this.executeRedemption(item.id, database);
    }
  }

  /**
   * Processes a single redemption item
   */
  async executeRedemption(id: string, database = db) {
    // 1. Fetch item and lock for processing
    const item = await database.query.redemptionsQueue.findFirst({
      where: eq(redemptionsQueue.id, id),
    });

    if (!item || item.status !== "PENDING") return;

    // 2. Transition to PROCESSING
    await database
      .update(redemptionsQueue)
      .set({ status: "PROCESSING", updatedAt: new Date() })
      .where(eq(redemptionsQueue.id, id));

    try {
      // 3. Call Payout Provider
      const response = await this.provider.executePayout({
        tenantId: item.tenantId,
        redemptionId: item.id,
        amount: parseFloat(item.amountValue),
        currency: item.currencyCode,
        destination: item.destinationAccount,
        fulfillmentStrategy: item.fulfillmentMode,
        idempotencyKey: item.idempotencyKey || undefined,
      });

      if (response.success) {
        // 4. Update to SUCCESS
        await database
          .update(redemptionsQueue)
          .set({
            status: "SUCCESS",
            externalReference: response.externalReference,
            metadata: { ...((item.metadata as object) || {}), payoutResponse: response.rawResponse },
            updatedAt: new Date(),
          })
          .where(eq(redemptionsQueue.id, id));
        
        console.log(`[RedemptionHandler] ✅ Redemption ${id} SUCCESS.`);
      } else {
        // 5. Update to FAILED (Retry later)
        await database
          .update(redemptionsQueue)
          .set({
            status: "PENDING", // Hold in PENDING for retry
            retryCount: item.retryCount + 1,
            lastError: response.error || "Unknown provider error",
            updatedAt: new Date(),
          })
          .where(eq(redemptionsQueue.id, id));
        
        console.warn(`[RedemptionHandler] ⚠️ Redemption ${id} FAILED attempt ${item.retryCount + 1}: ${response.error}`);
      }
    } catch (error: any) {
      // 6. Handle unexpected crashes
      await database
        .update(redemptionsQueue)
        .set({
          status: "FAILED",
          lastError: error.message || "Internal Handler Error",
          updatedAt: new Date(),
        })
        .where(eq(redemptionsQueue.id, id));
      
      console.error(`[RedemptionHandler] ❌ Redemption ${id} CRITICAL FAILURE:`, error.message);
    }
  }
}
