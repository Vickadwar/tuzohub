import { db } from "./index";
import * as schema from "./schema";
import { supabaseAdmin } from "../lib/supabase";
import * as dotenv from "dotenv";
import { eq, sql } from "drizzle-orm";

dotenv.config();

async function getOrCreateAuthUser(email: string, password: string) {
  if (!supabaseAdmin) {
    console.error("❌ Supabase Admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY.");
    return null;
  }

  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = users?.find((u: any) => u.email === email);

  if (existingUser) {
    console.log(`ℹ️ Auth user already exists: ${email}. Updating password...`);
    const { data: updated, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      existingUser.id,
      { password, email_confirm: true }
    );
    if (updateError) {
      console.error(`⚠️ Failed to update password for ${email}:`, updateError.message);
    } else {
      console.log(`🔑 Password updated for ${email}`);
    }
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

async function wipeDatabase() {
  console.log("⚠️ Wiping all existing application tables for a fresh start...");
  const tableList = [
    "audit_logs",
    "vouchers",
    "voucher_batches",
    "product_batches",
    "products",
    "categories",
    "reward_redemptions",
    "reward_items",
    "reward_categories",
    "organization_members",
    "sales_hierarchy_assignments",
    "organizations",
    "sales_hierarchy",
    "towns",
    "regions",
    "tenant_channels",
    "tenant_settings",
    "users",
    "tenants",
    "counties",
    "countries",
    "currencies"
  ];

  for (const table of tableList) {
    try {
      await db.execute(sql.raw(`DELETE FROM "${table}";`));
    } catch (e: any) {
      // Ignore table missing errors silently
    }
  }
  console.log("✨ Database wiped clean!");
}

async function main() {
  console.log("🌱 Initializing Fresh TuzoHub Production Seed...");

  try {
    const shouldWipe = process.argv.includes("--wipe") || process.env.WIPE_DB === "true";
    if (shouldWipe) {
      await wipeDatabase();
    }

    // 1. Seed Global Currencies
    console.log("💰 Inserting Master Currencies...");
    await db.insert(schema.currencies).values([
      { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
      { code: "USD", name: "US Dollar", symbol: "$" },
      { code: "EUR", name: "Euro", symbol: "€" },
      { code: "GBP", name: "British Pound", symbol: "£" },
      { code: "UGX", name: "Ugandan Shilling", symbol: "USh" },
      { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh" },
      { code: "RWF", name: "Rwandan Franc", symbol: "FRw" },
    ]).onConflictDoNothing();

    // 2. Seed Global Countries
    console.log("🌍 Inserting Master Countries...");
    const countriesResp = await db.insert(schema.countries).values([
      { name: "Kenya", code: "KE", dialingCode: "+254" },
      { name: "Uganda", code: "UG", dialingCode: "+256" },
      { name: "Tanzania", code: "TZ", dialingCode: "+255" },
      { name: "Rwanda", code: "RW", dialingCode: "+250" },
    ]).onConflictDoNothing().returning();

    let kenya = countriesResp.find(c => c.code === "KE");
    if (!kenya) {
      kenya = await db.query.countries.findFirst({
        where: eq(schema.countries.code, "KE")
      });
    }
    if (!kenya) throw new Error("Kenya country seeding failed");

    // 3. Seed Kenya Counties
    console.log("📍 Inserting Kenya Counties...");
    const kenyaCounties = [
      { name: "Mombasa", code: "001" },
      { name: "Kwale", code: "002" },
      { name: "Kilifi", code: "003" },
      { name: "Tana River", code: "004" },
      { name: "Lamu", code: "005" },
      { name: "Taita/Taveta", code: "006" },
      { name: "Garissa", code: "007" },
      { name: "Wajir", code: "008" },
      { name: "Mandera", code: "009" },
      { name: "Marsabit", code: "010" },
      { name: "Isiolo", code: "011" },
      { name: "Meru", code: "012" },
      { name: "Tharaka-Nithi", code: "013" },
      { name: "Embu", code: "014" },
      { name: "Kitui", code: "015" },
      { name: "Machakos", code: "016" },
      { name: "Makueni", code: "017" },
      { name: "Nyandarua", code: "018" },
      { name: "Nyeri", code: "019" },
      { name: "Kirinyaga", code: "020" },
      { name: "Murang'a", code: "021" },
      { name: "Kiambu", code: "022" },
      { name: "Turkana", code: "023" },
      { name: "West Pokot", code: "024" },
      { name: "Samburu", code: "025" },
      { name: "Trans Nzoia", code: "026" },
      { name: "Uasin Gishu", code: "027" },
      { name: "Elgeyo/Marakwet", code: "028" },
      { name: "Nandi", code: "029" },
      { name: "Baringo", code: "030" },
      { name: "Laikipia", code: "031" },
      { name: "Nakuru", code: "032" },
      { name: "Narok", code: "033" },
      { name: "Kajiado", code: "034" },
      { name: "Kericho", code: "035" },
      { name: "Bomet", code: "036" },
      { name: "Kakamega", code: "037" },
      { name: "Vihiga", code: "038" },
      { name: "Bungoma", code: "039" },
      { name: "Busia", code: "040" },
      { name: "Siaya", code: "041" },
      { name: "Kisumu", code: "042" },
      { name: "Homa Bay", code: "043" },
      { name: "Migori", code: "044" },
      { name: "Kisii", code: "045" },
      { name: "Nyamira", code: "046" },
      { name: "Nairobi City", code: "047" },
    ].map(c => ({ ...c, countryId: kenya.id }));

    await db.insert(schema.counties).values(kenyaCounties).onConflictDoNothing();

    // 4. Create Platform Owner Tenant: Tuzo Hub
    console.log("🏢 Creating Platform Owner Tenant: Tuzo Hub...");
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

    let masterTenant: typeof masterTenantResp[0] | undefined = masterTenantResp[0];
    if (!masterTenant) {
      masterTenant = await db.query.tenants.findFirst({
        where: eq(schema.tenants.slug, "tuzohub")
      });
    }
    if (!masterTenant) throw new Error("Master tenant creation failed");

    // 5. Create Platform Super Admin
    const SYSTEM_ADMIN_EMAIL = "admin@tuzohub.com";
    const SYSTEM_ADMIN_PASSWORD = "TuzoHub2026!";

    const systemAdminAuthId = await getOrCreateAuthUser(SYSTEM_ADMIN_EMAIL, SYSTEM_ADMIN_PASSWORD);

    if (systemAdminAuthId) {
      console.log(`👤 Syncing Super Admin to DB (Email: ${SYSTEM_ADMIN_EMAIL})...`);
      await db.insert(schema.users).values({
        id: systemAdminAuthId,
        tenantId: masterTenant.id,
        email: SYSTEM_ADMIN_EMAIL,
        firstName: "Tuzo Hub",
        lastName: "Super Admin",
        role: "SYSTEM_ADMIN",
        status: "active",
      }).onConflictDoNothing();
    }

    console.log("\n==================================================");
    console.log("✅ FRESH SEED COMPLETED SUCCESSFULLY!");
    console.log("==================================================");
    console.log("🏢 Platform Tenant : Tuzo Hub");
    console.log(`👤 Super Admin User: ${SYSTEM_ADMIN_EMAIL}`);
    console.log(`🔑 Password        : ${SYSTEM_ADMIN_PASSWORD}`);
    console.log("==================================================");
    console.log("💡 Ready for fresh tenant onboarding and operations.");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
