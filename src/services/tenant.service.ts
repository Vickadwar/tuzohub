import { db } from "../db";
import { tenants, tenantSettings, countries, currencies } from "../db/schema";
import { eq } from "drizzle-orm";

export class TenantService {
  static async getTenantBySlug(slug: string, tx: any = db) {
    const tenantRecords = await tx.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
    if (!tenantRecords || tenantRecords.length === 0) {
      throw new Error(`Tenant with slug ${slug} not found`);
    }

    const tenant = tenantRecords[0];

    const settingsRecords = await tx.select().from(tenantSettings).where(eq(tenantSettings.tenantId, tenant.id)).limit(1);
    const settings = settingsRecords.length > 0 ? settingsRecords[0] : null;

    return { ...tenant, settings };
  }

  static async getTenantById(id: string, tx: any = db) {
    const tenantRecords = await tx.select().from(tenants).where(eq(tenants.id, id)).limit(1);
    if (!tenantRecords || tenantRecords.length === 0) {
      throw new Error(`Tenant not found`);
    }

    const tenant = tenantRecords[0];

    // Also fetch country name for display
    let countryName = null;
    if (tenant.countryId) {
      const countryRecords = await tx.select().from(countries).where(eq(countries.id, tenant.countryId)).limit(1);
      if (countryRecords.length > 0) countryName = countryRecords[0].name;
    }

    const settingsRecords = await tx.select().from(tenantSettings).where(eq(tenantSettings.tenantId, tenant.id)).limit(1);
    const settings = settingsRecords.length > 0 ? settingsRecords[0] : null;

    return { ...tenant, countryName, settings };
  }

  static async getCountries(tx: any = db) {
    return await tx.select().from(countries);
  }

  static async getCurrencies(tx: any = db) {
    return await tx.select().from(currencies);
  }

  static async updateTenantSettings(slug: string, updates: any, tx: any = db) {
    const tenantRecords = await tx.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
    if (!tenantRecords || tenantRecords.length === 0) {
      throw new Error(`Tenant with slug ${slug} not found`);
    }

    const tenant = tenantRecords[0];

    // Upsert tenant settings
    const existingSettings = await tx.select().from(tenantSettings).where(eq(tenantSettings.tenantId, tenant.id)).limit(1);

    if (existingSettings.length > 0) {
      return await tx.update(tenantSettings)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(tenantSettings.tenantId, tenant.id))
        .returning();
    } else {
      return await tx.insert(tenantSettings)
        .values({ tenantId: tenant.id, ...updates })
        .returning();
    }
  }
}
