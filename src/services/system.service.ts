import { db } from "../db";
import { tenants, tenantSettings, users, countries, currencies, wallets, consumers } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { supabaseAdmin } from "../lib/supabase";
import { v4 as uuidv4 } from "uuid";

export class SystemService {
  /**
   * Public registration request. 
   * Creates a tenant in 'pending' status and an auth user.
   */
  static async registerTenantRequest(payload: {
    tenantName: string;
    orgEmail: string;
    orgPhone?: string;
    taxPin?: string;
    adminEmail: string;
    adminPassword: string;
    firstName: string;
    lastName: string;
    countryId: string;
  }) {
    // 1. Check if user email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, payload.adminEmail),
    });
    if (existingUser) throw new Error("Admin email already registered.");

    // 2. Check if organization email or Tax PIN already exists
    const existingOrgEmail = await db.query.tenants.findFirst({
      where: eq(tenants.email, payload.orgEmail),
    });
    if (existingOrgEmail) throw new Error("Organization email already registered.");

    if (payload.taxPin) {
      const existingTaxPin = await db.query.tenants.findFirst({
        where: eq(tenants.taxPin, payload.taxPin),
      });
      if (existingTaxPin) throw new Error("Tax PIN already registered.");
    }

    // 3. Fetch country
    const [country] = await db.select().from(countries).where(eq(countries.id, payload.countryId)).limit(1);
    if (!country) throw new Error("Country not supported.");

    const [currency] = await db.select().from(currencies).where(eq(currencies.code, "KES")).limit(1);

    return await db.transaction(async (tx) => {
      // 4. Create Tenant in PENDING status
      const tenantId = uuidv4();
      const slug = payload.tenantName.toLowerCase().replace(/\s+/g, "-") + "-" + Math.floor(1000 + Math.random() * 9000);
      
      const [newTenant] = await tx.insert(tenants).values({
        id: tenantId,
        name: payload.tenantName,
        slug: slug,
        countryId: country.id,
        baseCurrency: currency?.code || "KES",
        defaultPointValue: "1.00",
        status: "pending",
        isActive: false, 
        email: payload.orgEmail,
        phone: payload.orgPhone,
        taxPin: payload.taxPin,
      }).returning();

      // 4. Create Tenant Settings
      await tx.insert(tenantSettings).values({
        tenantId: tenantId,
      });

      // 5. Create Auth User via Supabase Admin (bypassing email confirmation)
      if (!supabaseAdmin) throw new Error("Supabase Admin client not configured.");

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: payload.adminEmail,
        password: payload.adminPassword,
        email_confirm: true,
        user_metadata: {
          firstName: payload.firstName,
          lastName: payload.lastName,
          tenantId: tenantId,
          role: "TENANT_ADMIN"
        }
      });

      if (authError) throw new Error(`Auth creation failed: ${authError.message}`);

      // 6. Create User record in our DB
      await tx.insert(users).values({
        id: authData.user.id,
        tenantId: tenantId,
        email: payload.adminEmail,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: "TENANT_ADMIN",
        status: "active",
      });

      return { tenantId, slug };
    });
  }

  /**
   * Super Admin approval
   */
  static async approveTenant(tenantId: string) {
    return await db.update(tenants)
      .set({ 
        status: "active", 
        isActive: true,
        updatedAt: new Date()
      })
      .where(eq(tenants.id, tenantId))
      .returning();
  }

  /**
   * Super Admin decline
   */
  static async declineTenant(tenantId: string) {
    return await db.update(tenants)
      .set({ 
        status: "declined", 
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(tenants.id, tenantId))
      .returning();
  }

  /**
   * Get all registrations for Super Admin
   */
  static async getRegistrations() {
    return await db.query.tenants.findMany({
      with: { country: true },
      orderBy: sql`created_at DESC`
    });
  }

  /**
   * Get list of countries for registration
   */
  static async getCountries() {
    return await db.select().from(countries);
  }

  static async getPlatformStats() {
    const [
      tenantCount,
      activeTenants,
      pendingRegistrations,
      totalPoints,
      totalConsumers
    ] = await Promise.all([
      db.select({ count: sql`count(*)` }).from(tenants),
      db.select({ count: sql`count(*)` }).from(tenants).where(eq(tenants.status, "active")),
      db.select({ count: sql`count(*)` }).from(tenants).where(eq(tenants.status, "pending")),
      db.select({ total: sql`sum(points_balance::numeric)` }).from(wallets),
      db.select({ count: sql`count(*)` }).from(consumers),
    ]);

    return {
      totalTenants: Number(tenantCount[0]?.count || 0),
      activeTenants: Number(activeTenants[0]?.count || 0),
      pendingRegistrations: Number(pendingRegistrations[0]?.count || 0),
      globalPointsCirculation: totalPoints[0]?.total || "0",
      totalConsumers: Number(totalConsumers[0]?.count || 0),
    };
  }
}
