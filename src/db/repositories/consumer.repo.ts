import { eq, and } from "drizzle-orm";
import { db } from "../index";
import { consumers } from "../schema";

export class ConsumerRepository {
  static async findByAuthId(authId: string) {
    return await db.query.consumers.findFirst({
      where: eq(consumers.authId, authId),
    });
  }

  static async findByPhoneNumber(tenantId: string, phoneNumber: string) {
    return await db.query.consumers.findFirst({
      where: and(
        eq(consumers.tenantId, tenantId),
        eq(consumers.phoneNumber, phoneNumber)
      ),
    });
  }

  static async findById(id: string) {
    return await db.query.consumers.findFirst({
      where: eq(consumers.id, id),
    });
  }

  static async update(id: string, data: Partial<typeof consumers.$inferInsert>) {
    return await db
      .update(consumers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(consumers.id, id))
      .returning();
  }
}
