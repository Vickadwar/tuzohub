import { db } from "../db";
import { organizations, organizationMembers, consumers, towns, regions, salesHierarchy, salesHierarchyAssignments } from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export class OrganizationService {
  static async createOrganization(data: any, tx: any = db) {
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
    const org = records[0];

    // Fetch town details
    let town: any = null;
    let region: any = null;
    if (org.townId) {
      const townRecords = await tx.select().from(towns).where(eq(towns.id, org.townId)).limit(1);
      if (townRecords.length > 0) {
        town = townRecords[0];
        if (town.regionId) {
          const regionRecords = await tx.select().from(regions).where(eq(regions.id, town.regionId)).limit(1);
          if (regionRecords.length > 0) {
            region = regionRecords[0];
          }
        }
      }
    }

    // Fetch assigned sales person
    let salesStaff: any = null;
    let salesPersonId: string | null = null;
    const assignRecords = await tx.select()
      .from(salesHierarchyAssignments)
      .where(eq(salesHierarchyAssignments.organizationId, id))
      .limit(1);

    if (assignRecords.length > 0 && assignRecords[0].staffId) {
      const targetStaffId = assignRecords[0].staffId;
      salesPersonId = targetStaffId;
      const staffRecords = await tx.select().from(salesHierarchy).where(eq(salesHierarchy.id, targetStaffId)).limit(1);
      if (staffRecords.length > 0) {
        salesStaff = staffRecords[0];
      }
    }

    return {
      ...org,
      town,
      region,
      regionId: region?.id || null,
      salesStaff,
      salesPersonId,
    };
  }

  static async updateOrganization(id: string, tenantId: string, updates: any, tx: any = db) {
    const { salesPersonId, regionId, ...orgFields } = updates;

    const result = await tx.update(organizations)
      .set({ ...orgFields, updatedAt: new Date() })
      .where(and(eq(organizations.id, id), eq(organizations.tenantId, tenantId)))
      .returning();

    if (result.length === 0) throw new Error("Organization not found or failed to update");
    const updatedOrg = result[0];

    // Update sales staff assignment if provided
    if (salesPersonId !== undefined) {
      await tx.delete(salesHierarchyAssignments)
        .where(eq(salesHierarchyAssignments.organizationId, id));

      if (salesPersonId && salesPersonId.trim()) {
        await tx.insert(salesHierarchyAssignments).values({
          id: uuidv4(),
          tenantId,
          staffId: salesPersonId.trim(),
          organizationId: id,
        });
      }
    }

    return await this.getOrganizationById(id, tenantId, tx);
  }

  static async addMember(organizationId: string, consumerId: string, role: string, tx: any = db) {
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

  static async deleteOrganization(id: string, tenantId: string, tx: any = db) {
    const result = await tx.update(organizations)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(organizations.id, id), eq(organizations.tenantId, tenantId)))
      .returning();

    if (result.length === 0) throw new Error("Organization not found or already deleted");
    return result[0];
  }
}
