import { db } from "./index";
import * as schema from "./schema";
import { supabaseAdmin } from "../lib/supabase";
import * as dotenv from "dotenv";

dotenv.config();

async function getOrCreateAuthUser(email: string, password: string) {
  if (!supabaseAdmin) {
    console.error("❌ Supabase Admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY.");
    return null;
  }

  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = users.find(u => u.email === email);

  if (existingUser) {
    console.log(`ℹ️ Auth user already exists: ${email}`);
    return existingUser.id;
  }

  console.log(`🆕 Creating Auth user: ${email}...`);
  const { data: { user }, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    console.error(`❌ Failed to create auth user ${email}:`, createError.message);
    return null;
  }

  return user?.id || null;
}

async function main() {
  console.log("🌱 Seeding Master Data for TuzoHub...");

  try {
    // 1. Seed Global Currencies
    console.log("💰 Inserting Global Currencies...");
    await db.insert(schema.currencies).values([
      { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
      { code: "USD", name: "US Dollar", symbol: "$" },
    ]).onConflictDoNothing();

    // 2. Seed Global Countries
    console.log("🌍 Inserting Global Countries...");
    const countriesResp = await db.insert(schema.countries).values([
      { name: "Kenya", code: "KE", dialingCode: "+254" },
    ]).onConflictDoNothing().returning();

    const kenya = countriesResp.find(c => c.code === "KE");
    if (!kenya) throw new Error("Kenya country seeding failed");

    // 3. Seed Global Counties (Sample)
    console.log("📍 Inserting Global Counties...");
    const countiesData = [
      { name: "Nairobi City", code: "047" },
      { name: "Kiambu", code: "022" },
      { name: "Nakuru", code: "032" },
    ].map(c => ({ ...c, countryId: kenya.id }));

    const countiesFullResp = await db.insert(schema.counties).values(countiesData).onConflictDoNothing().returning();
    const nairobi = countiesFullResp.find(c => c.name === "Nairobi City");

    // 4. Create Master Tenant: Tuzo Hub (Platform Owner)
    console.log("🏢 Creating Master Tenant: Tuzo Hub...");
    const masterTenantResp = await db.insert(schema.tenants).values({
      name: "Tuzo Hub",
      slug: "tuzohub",
      email: "info@tuzohub.com",
      countryId: kenya.id,
      baseCurrency: "KES",
      defaultPointValue: "1.00",
      pointExpiryMonths: 36,
      status: "active",
      plan: "enterprise",
      isPlatformOwner: true,
    }).onConflictDoNothing().returning();

    const masterTenant = masterTenantResp[0];
    if (!masterTenant) throw new Error("Master tenant creation failed");

    // 5. Create System Admin
    const SYSTEM_ADMIN_EMAIL = "admin@tuzohub.com";
    const systemAdminAuthId = await getOrCreateAuthUser(SYSTEM_ADMIN_EMAIL, "TuzoHub2026!");
    
    if (systemAdminAuthId) {
      console.log(`👤 Syncing System Admin to DB (Email: ${SYSTEM_ADMIN_EMAIL})...`);
      await db.insert(schema.users).values({
        id: systemAdminAuthId,
        tenantId: masterTenant.id,
        email: SYSTEM_ADMIN_EMAIL,
        firstName: "Tuzo Hub",
        lastName: "Admin",
        role: "SYSTEM_ADMIN",
        status: "active",
      }).onConflictDoNothing();
    }

    // 6. Create JOPI NY PAINTS Tenant
    console.log("🏢 Creating Jopiny Paints Tenant...");
    const jopinyTenantResp = await db.insert(schema.tenants).values({
      name: "Jopiny Paints",
      slug: "jopiny-paints",
      email: "loyalty@jopinypaints.com",
      countryId: kenya.id,
      baseCurrency: "KES",
      defaultPointValue: "1.00", // 1 Point = 1 KES
      pointExpiryMonths: 24,
      status: "active",
      plan: "professional",
      isPlatformOwner: false,
    }).onConflictDoNothing().returning();

    const jopinyTenant = jopinyTenantResp[0];
    if (jopinyTenant) {
      const JOPINY_ADMIN_EMAIL = "admin@jopinypaints.com";
      const jopinyAdminAuthId = await getOrCreateAuthUser(JOPINY_ADMIN_EMAIL, "Jopiny2026!");

      if (jopinyAdminAuthId) {
        console.log(`👤 Syncing Tenant Admin for Jopiny Paints to DB (Email: ${JOPINY_ADMIN_EMAIL})...`);
        await db.insert(schema.users).values({
          id: jopinyAdminAuthId,
          tenantId: jopinyTenant.id,
          email: JOPINY_ADMIN_EMAIL,
          firstName: "Jopiny",
          lastName: "Admin",
          role: "TENANT_ADMIN",
          status: "active",
        }).onConflictDoNothing();
      }

      // 8. Jopiny Paints Products
      console.log("📦 Inserting Jopiny Paints Products...");
      const productsResp = await db.insert(schema.products).values([
        { 
          tenantId: jopinyTenant.id, 
          sku: "SILK-4L", 
          name: "Silk 4 Litres", 
          category: "Paints", 
          pointsPerUnit: 50, 
          price: "50", 
          isActive: true 
        },
        { 
          tenantId: jopinyTenant.id, 
          sku: "SILK-20L", 
          name: "Silk 20 Litres", 
          category: "Paints", 
          pointsPerUnit: 200, 
          price: "200", 
          isActive: true 
        },
      ]).onConflictDoNothing().returning();

      // 10. Rewards & Redemptions
      console.log("🎁 Inserting Jopiny Paints Rewards...");
      const catResp = await db.insert(schema.rewardCategories).values([
        { tenantId: jopinyTenant.id, name: "Cash & Airtime", displayOrder: 1, isActive: true }
      ]).onConflictDoNothing().returning();
      
      if(catResp.length > 0) {
        await db.insert(schema.rewardItems).values([
          { 
            tenantId: jopinyTenant.id, 
            categoryId: catResp[0].id, 
            name: "KSh 50 M-Pesa Payout", 
            rewardType: "CASH" as any, 
            fulfillmentStrategy: "AUTOMATED_PAYOUT" as any, 
            requiredPoints: "50", 
            isActive: true 
          },
          { 
            tenantId: jopinyTenant.id, 
            categoryId: catResp[0].id, 
            name: "KSh 200 M-Pesa Payout", 
            rewardType: "CASH" as any, 
            fulfillmentStrategy: "AUTOMATED_PAYOUT" as any, 
            requiredPoints: "200", 
            isActive: true 
          },
        ]).onConflictDoNothing();
      }
    }

    console.log("✅ Seeding completed successfully!");
    console.log("\n🚀 SYSTEM READY:");
    console.log("1. System Admin: admin@tuzohub.com / TuzoHub2026!");
    console.log("2. Jopiny Admin: admin@jopinypaints.com / Jopiny2026!");
    console.log("\n💡 You can now login to the dashboard immediately.");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
