import { db } from "../db";
import { challenges, consumerChallenges, badges, consumerBadges, consumers } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";

export class GamificationService {
  // CHALLENGES
  static async createChallenge(data: typeof challenges.$inferInsert, tx: any = db) {
    const result = await tx.insert(challenges).values({ ...data, isActive: true }).returning();
    return result[0];
  }

  static async getActiveChallenges(tenantId: string, tx: any = db) {
    return await tx.select().from(challenges).where(
      and(eq(challenges.tenantId, tenantId), eq(challenges.isActive, true))
    );
  }

  static async updateChallengeProgress(tenantId: string, consumerId: string, payload: { action: string, amount: number }, tx: any = db) {
    // 1. Fetch active challenges for tenant
    const activeChallenges = await this.getActiveChallenges(tenantId, tx);

    if (activeChallenges.length === 0) return;

    // 2. Iterate matching goals
    for (const challenge of activeChallenges) {
      if (
        (challenge.goalType === "TRANSACTION_COUNT" && payload.action === "PURCHASE") ||
        (challenge.goalType === "SPEND_AMOUNT" && payload.action === "SPEND")
      ) {
        // Find existing progress
        const [progress] = await tx.select().from(consumerChallenges).where(
          and(eq(consumerChallenges.consumerId, consumerId), eq(consumerChallenges.challengeId, challenge.id))
        ).limit(1);

        if (progress?.status === "COMPLETED") continue;

        let newValue = payload.amount;
        if (progress) {
          newValue = Number(progress.currentValue) + payload.amount;
          await tx.update(consumerChallenges)
            .set({ 
              currentValue: newValue.toString(),
              status: newValue >= Number(challenge.goalValue) ? "COMPLETED" : "IN_PROGRESS",
              completedAt: newValue >= Number(challenge.goalValue) ? new Date() : null,
              updatedAt: new Date()
            })
            .where(eq(consumerChallenges.id, progress.id));
        } else {
          await tx.insert(consumerChallenges).values({
            tenantId,
            consumerId,
            challengeId: challenge.id,
            currentValue: newValue.toString(),
            status: newValue >= Number(challenge.goalValue) ? "COMPLETED" : "IN_PROGRESS",
            completedAt: newValue >= Number(challenge.goalValue) ? new Date() : null,
          });
        }

        // If newly completed, trigger reward 
        // Note: Reward logic should be handled by LoyaltyService, importing it dynamically or emitting an event.
        if (newValue >= Number(challenge.goalValue) && (!progress || progress.status !== "COMPLETED")) {
          // Hook into points system omitted here to prevent circular dependency, 
          // usually done via pub/sub or direct explicit call in the main transaction.
        }
      }
    }
  }

  // BADGES
  static async createBadge(data: typeof badges.$inferInsert, tx: any = db) {
    const result = await tx.insert(badges).values(data).returning();
    return result[0];
  }

  static async awardBadgeToConsumer(badgeId: string, consumerId: string, tx: any = db) {
    const result = await tx.insert(consumerBadges).values({
      badgeId,
      consumerId,
    }).returning();
    return result[0];
  }

  static async getConsumerBadges(consumerId: string, tx: any = db) {
    return await tx.select({
      id: consumerBadges.id,
      awardedAt: consumerBadges.awardedAt,
      badge: {
        name: badges.name,
        description: badges.description,
        imageUrl: badges.imageUrl,
      }
    })
    .from(consumerBadges)
    .innerJoin(badges, eq(consumerBadges.badgeId, badges.id))
    .where(eq(consumerBadges.consumerId, consumerId));
  }
}
