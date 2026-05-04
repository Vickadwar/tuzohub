import { db } from "../db";
import { referrals, consumers } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { LoyaltyService } from "./loyalty.service";

export class ReferralService {
  static async generateReferralCodeForConsumer(consumerId: string, tx: any = db) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    await tx.update(consumers).set({ referralCode: code }).where(eq(consumers.id, consumerId));
    return code;
  }

  static async applyReferralCode(tenantId: string, referredConsumerId: string, code: string, tx: any = db) {
    // 1. Find referrer
    const [referrer] = await tx.select().from(consumers).where(
      and(eq(consumers.tenantId, tenantId), eq(consumers.referralCode, code))
    ).limit(1);

    if (!referrer) throw new Error("Invalid referral code");
    if (referrer.id === referredConsumerId) throw new Error("Cannot refer yourself");

    // 2. Link consumer table
    await tx.update(consumers)
      .set({ referredBy: referrer.id })
      .where(eq(consumers.id, referredConsumerId));

    // 3. Create referral tracking row
    const [referralRow] = await tx.insert(referrals).values({
      tenantId,
      referrerConsumerId: referrer.id,
      referredConsumerId: referredConsumerId,
      referralCode: code,
      status: "PENDING",
    }).returning();

    return referralRow;
  }

  static async completeReferralOnFirstPurchase(tenantId: string, newConsumerId: string, tx: any = db) {
    // Has this consumer been referred?
    const [pendingReferral] = await tx.select().from(referrals).where(
      and(
        eq(referrals.tenantId, tenantId),
        eq(referrals.referredConsumerId, newConsumerId),
        eq(referrals.status, "PENDING")
      )
    ).limit(1);

    if (!pendingReferral) return;

    // Standard reward amount for demo. Alternatively fetch from tenantSettings
    const rewardPoints = "500";

    // Mark as completed
    await tx.update(referrals)
      .set({ 
        status: "COMPLETED", 
        completedAt: new Date(), 
        rewardPointsAwarded: rewardPoints,
        rewardIssuedAt: new Date()
      })
      .where(eq(referrals.id, pendingReferral.id));

    // Update referrer aggregations
    await tx.execute(
      db.update(consumers)
        .set({ 
          referralCount: sql`referral_count + 1`,
          referralPointsEarned: sql`referral_points_earned + ${rewardPoints}`
        })
        .where(eq(consumers.id, pendingReferral.referrerConsumerId))
    );

    // Call LoyaltyService to actually credit the referrer wallet
    await LoyaltyService.processEarning({
      tenantId,
      consumerId: pendingReferral.referrerConsumerId,
      points: rewardPoints,
      actionCategory: "REFERRAL_BONUS",
      description: "Bonus for referring a new purchasing customer",
    }, tx);
  }
}
