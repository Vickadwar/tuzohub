import { db } from "../db";
import { partnerPrograms } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export class PartnerService {
  static async createPartnerProgram(
    tenantId: string,
    data: {
      partnerTenantId: string;
      name: string;
      exchangeRate: string;
      startDate: string;
      endDate?: string;
    },
    tx: any = db
  ) {
    const { partnerTenantId, name, exchangeRate, startDate, endDate } = data;

    const [program] = await tx.insert(partnerPrograms).values({
      id: uuidv4(),
      tenantId,
      partnerTenantId,
      name,
      exchangeRate,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      isActive: true,
    }).returning();

    return program;
  }

  static async getTenantPartnerPrograms(tenantId: string, tx: any = db) {
    return await tx.select().from(partnerPrograms).where(
      and(
        eq(partnerPrograms.tenantId, tenantId),
        eq(partnerPrograms.isActive, true)
      )
    );
  }
}
