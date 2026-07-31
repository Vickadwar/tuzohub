import { db } from "../db";
import { usageMeters, invoices, tenants } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export class BillingService {
  /**
   * Record metric usage automatically.
   */
  static async recordUsage(tenantId: string, metricName: string, quantity = 1, tx: any = db) {
    const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

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
    const [tenant] = await tx.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    const baseFee = tenant?.plan === "enterprise" ? "5000.00" : "1000.00";

    const [invoice] = await tx.insert(invoices).values({
      id: uuidv4(),
      tenantId,
      invoiceNumber: `INV-${Date.now()}`,
      amount: baseFee,
      items: [{ description: "Base Monthly Subscription", amount: baseFee }],
      status: "PENDING",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    }).returning();

    return invoice;
  }

  static async getInvoices(tenantId: string, tx: any = db) {
    return await tx.select({
      id: invoices.id,
      tenantId: invoices.tenantId,
      invoiceNumber: invoices.invoiceNumber,
      totalAmount: invoices.amount,
      status: invoices.status,
      dueDate: invoices.dueDate,
      createdAt: invoices.createdAt,
    }).from(invoices).where(eq(invoices.tenantId, tenantId));
  }

  static async getAllInvoices(tx: any = db) {
    const results = await tx.select({
      id: invoices.id,
      tenantId: invoices.tenantId,
      invoiceNumber: invoices.invoiceNumber,
      totalAmount: invoices.amount,
      status: invoices.status,
      dueDate: invoices.dueDate,
      createdAt: invoices.createdAt,
      tenantName: tenants.name,
      plan: tenants.plan,
    })
    .from(invoices)
    .leftJoin(tenants, eq(invoices.tenantId, tenants.id))
    .orderBy(sql`invoices.created_at DESC`);

    return results.map((r: any) => ({
      id: r.id,
      tenantId: r.tenantId,
      invoiceNumber: r.invoiceNumber,
      totalAmount: r.totalAmount,
      status: r.status,
      dueDate: r.dueDate,
      createdAt: r.createdAt,
      tenant: {
        name: r.tenantName,
        subscriptionPlan: r.plan ? r.plan.toUpperCase() : "BASIC"
      }
    }));
  }
}
