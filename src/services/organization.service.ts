import { db } from "../db";
import { organizations, organizationMembers, consumers } from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";

export class OrganizationService {
  static async createOrganization(data: typeof organizations.$inferInsert, tx: any = db) {
    const result = await tx.insert(organizations).values(data).returning();
    return result[0];
  }

  static async getOrganizations(tenantId: string, tx: any = db) {
    return await tx.select().from(organizations).where(
      and(eq(organizations.tenantId, tenantId), isNull(organizations.deletedAt))
    );
  }

  static async getOrganizationById(id: string, tenantId: string, tx: any = db) {
    const records = await tx.select().from(organizations).where(
      and(eq(organizations.id, id), eq(organizations.tenantId, tenantId), isNull(organizations.deletedAt))
    ).limit(1);

    if (records.length === 0) throw new Error("Organization not found");
    return records[0];
  }

  static async updateOrganization(id: string, tenantId: string, updates: Partial<typeof organizations.$inferInsert>, tx: any = db) {
    const result = await tx.update(organizations)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(organizations.id, id), eq(organizations.tenantId, tenantId)))
      .returning();

    if (result.length === 0) throw new Error("Organization not found or failed to update");
    return result[0];
  }

  static async addMember(organizationId: string, consumerId: string, role: string, tx: any = db) {
    // Ensure consumer exists
    const consumerRecords = await tx.select().from(consumers).where(eq(consumers.id, consumerId)).limit(1);
    if (consumerRecords.length === 0) throw new Error("Consumer not found");

    const result = await tx.insert(organizationMembers).values({
      organizationId,
      consumerId,
      role,
      isActive: true,
    }).returning();
    return result[0];
  }

  static async getMembers(organizationId: string, tx: any = db) {
    return await tx.select({
      id: organizationMembers.id,
      role: organizationMembers.role,
      joinedAt: organizationMembers.joinedAt,
      consumer: {
        id: consumers.id,
        firstName: consumers.firstName,
        lastName: consumers.lastName,
        phoneNumber: consumers.phoneNumber,
        loyaltyNumber: consumers.loyaltyNumber,
      }
    })
    .from(organizationMembers)
    .innerJoin(consumers, eq(organizationMembers.consumerId, consumers.id))
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.isActive, true)
      )
    );
  }

  static async removeMember(organizationId: string, memberId: string, tx: any = db) {
    const result = await tx.update(organizationMembers)
      .set({ isActive: false })
      .where(and(eq(organizationMembers.id, memberId), eq(organizationMembers.organizationId, organizationId)))
      .returning();
    
    if (result.length === 0) throw new Error("Member not found or already removed");
    return result[0];
  }
}
