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

    // Split updates between 'tenants' table and 'tenant_settings' table
    const tenantFields = ["baseCurrency", "defaultPointValue", "pointExpiryMonths", "countryId", "name", "email"];
    const tenantUpdates: any = {};
    const settingsUpdates: any = {};

    Object.keys(updates).forEach(key => {
      if (tenantFields.includes(key)) {
        tenantUpdates[key] = updates[key];
      } else {
        settingsUpdates[key] = updates[key];
      }
    });

    // 1. Update tenants table if there are changes
    if (Object.keys(tenantUpdates).length > 0) {
      await tx.update(tenants)
        .set(tenantUpdates)
        .where(eq(tenants.id, tenant.id));
    }

    // 2. Upsert tenant_settings table
    if (Object.keys(settingsUpdates).length > 0) {
      const existingSettings = await tx.select().from(tenantSettings).where(eq(tenantSettings.tenantId, tenant.id)).limit(1);
      
      if (existingSettings.length > 0) {
        await tx.update(tenantSettings)
          .set({ ...settingsUpdates, updatedAt: new Date() })
          .where(eq(tenantSettings.tenantId, tenant.id));
      } else {
        await tx.insert(tenantSettings)
          .values({ tenantId: tenant.id, ...settingsUpdates });
      }
    }

    return { success: true };
  }
}
