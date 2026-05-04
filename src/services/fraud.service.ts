import { db } from "../db";
import { fraudRules, fraudAlerts, voucherRedemptionAttempts, consumers } from "../db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export class FraudService {
  static async getRules(tenantId: string, tx: any = db) {
    return await tx.select().from(fraudRules).where(and(eq(fraudRules.tenantId, tenantId), eq(fraudRules.isActive, true)));
  }

  static async createRule(data: typeof fraudRules.$inferInsert, tx: any = db) {
    const result = await tx.insert(fraudRules).values({ ...data, isActive: true }).returning();
    return result[0];
  }

  static async recordVoucherAttempt(tenantId: string, consumerId: string | null, attemptedCode: string, success: boolean, ipAddress: string | null, tx: any = db) {
    await tx.insert(voucherRedemptionAttempts).values({
      tenantId,
      consumerId,
      attemptedCode,
      success,
      ipAddress,
    });

    // Check for brute force (e.g. 5 failed attempts in 1 hour)
    if (!success && consumerId) {
      await this.evaluateBruteForce(tenantId, consumerId, tx);
    }
  }

  private static async evaluateBruteForce(tenantId: string, consumerId: string, tx: any = db) {
    const thresholdMinutes = 60;
    const maxFailures = 5;

    const recentFailures = await tx.select({ count: sql<number>`count(*)` })
      .from(voucherRedemptionAttempts)
      .where(
        and(
          eq(voucherRedemptionAttempts.consumerId, consumerId),
          eq(voucherRedemptionAttempts.success, false),
          sql`created_at >= NOW() - INTERVAL '${thresholdMinutes} minutes'`
        )
      );

    const count = Number(recentFailures[0]?.count || 0);

    if (count >= maxFailures) {
      await this.flagConsumer(tenantId, consumerId, "BRUTE_FORCE_DETECTED", "Too many failed voucher attempts", tx);
    }
  }

  static async evaluateVelocity(tenantId: string, consumerId: string, pointsAmount: number, tx: any = db) {
    // Basic hardcoded rule evaluation for demo. Realistically reads from fraudRules.
    const rules = await this.getRules(tenantId, tx);
    const velocityRule = rules.find((r: any) => r.ruleType === "VELOCITY_EARNING");
    
    if (velocityRule) {
      const { max_points_per_hour } = velocityRule.configuration as any;
      if (max_points_per_hour && pointsAmount > max_points_per_hour) {
        await this.flagConsumer(tenantId, consumerId, "VELOCITY_VIOLATION", `Attempted to earn ${pointsAmount} which exceeds hourly limit of ${max_points_per_hour}.`, tx);
        // Depending on severity, we could throw an Error here to halt the transaction entirely.
        if (velocityRule.severity === "BLOCK") {
           throw new Error("Fraud rule triggered: Transaction blocked due to velocity violation.");
        }
      }
    }
  }

  static async flagConsumer(tenantId: string, consumerId: string, ruleType: string, details: string, tx: any = db) {
    // Generate an alert
    await tx.insert(fraudAlerts).values({
      tenantId,
      consumerId,
      severity: "FLAG",
      details: { reason: details, type: ruleType },
    });

    // Block the consumer natively
    await tx.update(consumers)
      .set({ 
        canRedeemPoints: false, 
        canEarnPoints: false,
        riskScore: 100 
      })
      .where(eq(consumers.id, consumerId));
  }

  static async getAlerts(tenantId: string, status: "OPEN" | "REVIEWED" | "RESOLVED" = "OPEN", tx: any = db) {
    return await tx.select().from(fraudAlerts).where(
      and(
        eq(fraudAlerts.tenantId, tenantId),
        eq(fraudAlerts.status, status)
      )
    ).orderBy(desc(fraudAlerts.createdAt));
  }

  static async resolveAlert(id: string, tenantId: string, resolvedBy: string, status: string, resolutionNote: string, tx: any = db) {
    const alert = await tx.update(fraudAlerts)
      .set({ status, resolvedBy, resolutionNote, resolvedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(fraudAlerts.id, id), eq(fraudAlerts.tenantId, tenantId)))
      .returning();

    // If resolved as false positive, unblock consumer
    if (status === "FALSE_POSITIVE" && alert.length > 0) {
      await tx.update(consumers).set({
        canRedeemPoints: true,
        canEarnPoints: true,
        riskScore: 0
      }).where(eq(consumers.id, alert[0].consumerId));
    }

    return alert[0];
  }
}
