import { db } from "../db";
import { usageMeters, invoices, tenants, systemConfig } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";

export class BillingService {
  /**
   * Used in Middlewares to increment usage automatically.
   */
  static async recordUsage(tenantId: string, metricName: string, quantity = 1, tx: any = db) {
    const currentMonth = new Date().toISOString().slice(0, 7) + "-01"; // e.g. 2026-04-01

    // Optimistic UPSERT equivalent
    const [existing] = await tx.select().from(usageMeters)
      .where(and(eq(usageMeters.tenantId, tenantId), eq(usageMeters.metricName, metricName), eq(usageMeters.billingPeriodStart, new Date(currentMonth))))
      .limit(1);

    if (existing) {
      await tx.update(usageMeters)
        .set({ usageValue: sql`usage_value + ${quantity}` })
        .where(eq(usageMeters.id, existing.id));
    } else {
      const start = new Date(currentMonth);
      const end = new Date(start);
      end.setMonth(start.getMonth() + 1);

      await tx.insert(usageMeters).values({
        tenantId,
        metricName,
        billingPeriodStart: start,
        billingPeriodEnd: end,
        usageValue: quantity.toString()
      });
    }
  }

  static async generateInvoice(tenantId: string, tx: any = db) {
    // 1. Calculate costs based on usageMeters for previous month
    // 2. Fetch tenant active plan details
    // 3. Create invoice row
    
    const [tenant] = await tx.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    
    // Simplistic demo invoice generation
    const baseFee = tenant.subscriptionPlan === "ENTERPRISE" ? "5000" : "1000";

    const [invoice] = await tx.insert(invoices).values({
      tenantId,
      invoiceNumber: `INV-${Date.now()}`,
      periodStart: new Date(),
      periodEnd: new Date(),
      baseFee,
      usageFee: "0",
      totalAmount: baseFee,
      status: "DRAFT",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
    }).returning();

    return invoice;
  }

  static async getInvoices(tenantId: string, tx: any = db) {
    return await tx.select().from(invoices).where(eq(invoices.tenantId, tenantId));
  }

  static async getAllInvoices(tx: any = db) {
    return await tx.query.invoices.findMany({
      with: {
        tenant: true
      },
      orderBy: sql`created_at DESC`
    });
  }
}
