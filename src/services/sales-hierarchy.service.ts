import { db } from "../db";
import { salesHierarchy, salesHierarchyAssignments, organizations } from "../db/schema";
import { eq, and } from "drizzle-orm";

export class SalesHierarchyService {
  static async createStaff(data: typeof salesHierarchy.$inferInsert, tx: any = db) {
    const result = await tx.insert(salesHierarchy).values(data).returning();
    return result[0];
  }

  static async getStaffList(tenantId: string, tx: any = db) {
    return await tx.select().from(salesHierarchy).where(eq(salesHierarchy.tenantId, tenantId));
  }

  static async getStaffById(id: string, tenantId: string, tx: any = db) {
    const records = await tx.select().from(salesHierarchy).where(
      and(eq(salesHierarchy.id, id), eq(salesHierarchy.tenantId, tenantId))
    ).limit(1);
    if (records.length === 0) throw new Error("Staff member not found");
    return records[0];
  }

  static async updateStaff(id: string, tenantId: string, updates: Partial<typeof salesHierarchy.$inferInsert>, tx: any = db) {
    const result = await tx.update(salesHierarchy)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(salesHierarchy.id, id), eq(salesHierarchy.tenantId, tenantId)))
      .returning();
    if (result.length === 0) throw new Error("Staff member not found or failed to update");
    return result[0];
  }

  static async getSubordinates(managerId: string, tenantId: string, tx: any = db) {
    return await tx.select().from(salesHierarchy).where(
      and(
        eq(salesHierarchy.managerId, managerId),
        eq(salesHierarchy.tenantId, tenantId)
      )
    );
  }

  static async assignStaffToOrganization(tenantId: string, staffId: string, organizationId: string, tx: any = db) {
    const staffRecords = await tx.select().from(salesHierarchy).where(
      and(eq(salesHierarchy.id, staffId), eq(salesHierarchy.tenantId, tenantId))
    ).limit(1);
    
    if (staffRecords.length === 0) throw new Error("Staff member not found");

    const orgRecords = await tx.select().from(organizations).where(
      and(eq(organizations.id, organizationId), eq(organizations.tenantId, tenantId))
    ).limit(1);

    if (orgRecords.length === 0) throw new Error("Organization not found");

    const result = await tx.insert(salesHierarchyAssignments).values({
      tenantId,
      staffId,
      organizationId,
    }).returning();

    return result[0];
  }

  static async getStaffAssignments(staffId: string, tenantId: string, tx: any = db) {
    return await tx.select({
      assignmentId: salesHierarchyAssignments.id,
      assignedAt: salesHierarchyAssignments.assignedAt,
      organization: {
        id: organizations.id,
        name: organizations.name,
        type: organizations.type,
      }
    })
    .from(salesHierarchyAssignments)
    .innerJoin(organizations, eq(salesHierarchyAssignments.organizationId, organizations.id))
    .where(
      and(
        eq(salesHierarchyAssignments.staffId, staffId),
        eq(salesHierarchyAssignments.tenantId, tenantId)
      )
    );
  }
}

