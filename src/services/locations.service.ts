import { eq, and, isNull } from "drizzle-orm";
import { db } from "../db";
import { regions, towns, countries } from "../db/schema";
import { v4 as uuidv4 } from "uuid";

export class LocationsService {
  /**
   * ─── REGIONS ─────────────────────────────────────────────────────────────
   */

  static async getRegions(tenantId: string, tx?: any) {
    const dbClient = tx || db;
    return await dbClient
      .select()
      .from(regions)
      .where(and(eq(regions.tenantId, tenantId), isNull(regions.deletedAt)));
  }

  static async getRegionsWithCountryName(tenantId: string, tx?: any) {
    const dbClient = tx || db;
    return await dbClient
      .select({
        id: regions.id,
        name: regions.name,
        countryId: regions.countryId,
        countryName: countries.name,
        tenantId: regions.tenantId,
      })
      .from(regions)
      .leftJoin(countries, eq(regions.countryId, countries.id))
      .where(and(eq(regions.tenantId, tenantId), isNull(regions.deletedAt)));
  }

  static async getTownsWithRegionName(tenantId: string, tx?: any) {
    const dbClient = tx || db;
    return await dbClient
      .select({
        id: towns.id,
        name: towns.name,
        regionId: towns.regionId,
        regionName: regions.name,
        tenantId: towns.tenantId,
      })
      .from(towns)
      .leftJoin(regions, eq(towns.regionId, regions.id))
      .where(and(eq(towns.tenantId, tenantId), isNull(towns.deletedAt)));
  }

  static async getRegionById(id: string, tenantId: string, tx?: any) {
    const dbClient = tx || db;
    const records = await dbClient
      .select()
      .from(regions)
      .where(
        and(
          eq(regions.id, id),
          eq(regions.tenantId, tenantId),
          isNull(regions.deletedAt)
        )
      )
      .limit(1);

    if (records.length === 0) {
      throw new Error("Region not found.");
    }
    return records[0];
  }

  static async createRegion(payload: { name: string; countryId: string; tenantId: string }, tx?: any) {
    const dbClient = tx || db;
    const newRecord = await dbClient
      .insert(regions)
      .values({
        id: uuidv4(),
        tenantId: payload.tenantId,
        countryId: payload.countryId,
        name: payload.name,
      })
      .returning();

    return newRecord[0];
  }

  static async updateRegion(id: string, payload: { name?: string; countryId?: string }, tenantId: string, tx?: any) {
    const dbClient = tx || db;
    await this.getRegionById(id, tenantId, dbClient);

    const updated = await dbClient
      .update(regions)
      .set({
        ...payload,
      })
      .where(and(eq(regions.id, id), eq(regions.tenantId, tenantId)))
      .returning();

    return updated[0];
  }

  static async deleteRegion(id: string, tenantId: string, tx?: any) {
    const dbClient = tx || db;
    await this.getRegionById(id, tenantId, dbClient);

    const deleted = await dbClient
      .update(regions)
      .set({ deletedAt: new Date() })
      .where(and(eq(regions.id, id), eq(regions.tenantId, tenantId)))
      .returning();

    return deleted[0];
  }

  /**
   * ─── TOWNS ───────────────────────────────────────────────────────────────
   */

  static async getTowns(tenantId: string, tx?: any) {
    const dbClient = tx || db;
    return await dbClient
      .select()
      .from(towns)
      .where(and(eq(towns.tenantId, tenantId), isNull(towns.deletedAt)));
  }

  static async getTownById(id: string, tenantId: string, tx?: any) {
    const dbClient = tx || db;
    const records = await dbClient
      .select()
      .from(towns)
      .where(
        and(
          eq(towns.id, id),
          eq(towns.tenantId, tenantId),
          isNull(towns.deletedAt)
        )
      )
      .limit(1);

    if (records.length === 0) {
      throw new Error("Town not found.");
    }
    return records[0];
  }

  static async createTown(payload: { name: string; regionId: string; countyId?: string; tenantId: string }, tx?: any) {
    const dbClient = tx || db;

    // Verify Region exists
    await this.getRegionById(payload.regionId, payload.tenantId, dbClient);

    const newRecord = await dbClient
      .insert(towns)
      .values({
        id: uuidv4(),
        tenantId: payload.tenantId,
        regionId: payload.regionId,
        countyId: payload.countyId || null,
        name: payload.name,
      })
      .returning();

    return newRecord[0];
  }

  static async updateTown(id: string, payload: { name?: string; regionId?: string; countyId?: string }, tenantId: string, tx?: any) {
    const dbClient = tx || db;
    await this.getTownById(id, tenantId, dbClient);

    if (payload.regionId) {
       await this.getRegionById(payload.regionId, tenantId, dbClient);
    }

    const updated = await dbClient
      .update(towns)
      .set({
        ...payload,
      })
      .where(and(eq(towns.id, id), eq(towns.tenantId, tenantId)))
      .returning();

    return updated[0];
  }

  static async deleteTown(id: string, tenantId: string, tx?: any) {
    const dbClient = tx || db;
    await this.getTownById(id, tenantId, dbClient);

    const deleted = await dbClient
      .update(towns)
      .set({ deletedAt: new Date() })
      .where(and(eq(towns.id, id), eq(towns.tenantId, tenantId)))
      .returning();

    return deleted[0];
  }
}
