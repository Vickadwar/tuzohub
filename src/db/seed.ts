import { db } from "./index";
import * as schema from "./schema";
import { supabaseAdmin } from "../lib/supabase";
import * as dotenv from "dotenv";
import { eq, sql, and } from "drizzle-orm";
import * as crypto from "crypto";

dotenv.config();

async function getOrCreateAuthUser(email: string, password: string) {
  if (!supabaseAdmin) {
    console.error("❌ Supabase Admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY.");
    return null;
  }

  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = users.find((u: any) => u.email === email);

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

    let kenya = countriesResp.find(c => c.code === "KE");
    if (!kenya) {
      kenya = await db.query.countries.findFirst({
        where: eq(schema.countries.code, "KE")
      });
    }
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

    let masterTenant: typeof masterTenantResp[0] | undefined = masterTenantResp[0];
    if (!masterTenant) {
      masterTenant = await db.query.tenants.findFirst({
        where: eq(schema.tenants.slug, "tuzohub")
      });
    }
    if (!masterTenant) throw new Error("Master tenant creation failed");

    // 5. Create System Admin
    const SYSTEM_ADMIN_EMAIL = "admin@tuzohub.com";
    const systemAdminAuthId = await getOrCreateAuthUser(SYSTEM_ADMIN_EMAIL, "TuzoHub1.$");
    
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

    if (process.env.NODE_ENV !== "production") {
      // 6. Create JOPI NY PAINTS Tenant
      console.log("🏢 Creating Jopiny Paints Tenant (Development Only)...");
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

    let jopinyTenant: typeof jopinyTenantResp[0] | undefined = jopinyTenantResp[0];
    if (!jopinyTenant) {
      jopinyTenant = await db.query.tenants.findFirst({
        where: eq(schema.tenants.slug, "jopiny-paints")
      });
    }
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

    // 11. Create GAMMA COATINGS Tenant
    console.log("🏢 Creating Gamma Coatings Tenant...");
    const gammaTenantResp = await db.insert(schema.tenants).values({
      name: "Gamma Coatings",
      slug: "gamma-coatings",
      email: "loyalty@gammacoatings.com",
      countryId: kenya.id,
      baseCurrency: "KES",
      defaultPointValue: "1.00",
      pointExpiryMonths: 24,
      status: "active",
      plan: "professional",
      isPlatformOwner: false,
    }).onConflictDoNothing().returning();

    const gammaTenant = gammaTenantResp[0] || await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, "gamma-coatings")
    });

    if (gammaTenant) {
      const GAMMA_ADMIN_EMAIL = "admin@gammacoatings.com";
      const gammaAdminAuthId = await getOrCreateAuthUser(GAMMA_ADMIN_EMAIL, "Gamma2026!");

      if (gammaAdminAuthId) {
        console.log(`👤 Syncing Tenant Admin for Gamma Coatings to DB (Email: ${GAMMA_ADMIN_EMAIL})...`);
        await db.insert(schema.users).values({
          id: gammaAdminAuthId,
          tenantId: gammaTenant.id,
          email: GAMMA_ADMIN_EMAIL,
          firstName: "Gamma",
          lastName: "Admin",
          role: "TENANT_ADMIN",
          status: "active",
        }).onConflictDoNothing();
      }

      console.log("⚙️ Inserting Gamma Coatings Settings...");
      await db.insert(schema.tenantSettings).values({
        tenantId: gammaTenant.id,
        credentials: {
          smsProvider: "bongasms",
          bongaApiClientID: "254",
          bongaApiKey: "BongaApiKey_SAMPLE_KEY",
          bongaApiSecret: "BongaApiSecret_SAMPLE_SECRET",
          bongaServiceID: "1",
          atUsername: "sandbox",
          atApiKey: "AtApiKey_PLACEHOLDER",
          atSenderId: "GammaCoatings",
          darBaseUrl: "https://sandbox.safaricom.co.ke",
          darajaConsumerKey: "DarajaConsumerKey_PLACEHOLDER",
          darajaConsumerSecret: "DarajaConsumerSecret_PLACEHOLDER",
          darajaShortCode: "600000",
          darajaInitiatorName: "TUZO_INIT",
          darajaInitiatorPassword: "Password123",
          darajaSecurityCredential: "CREDENTIAL_HASH",
        },
      }).onConflictDoNothing();

      console.log("📍 Seeding Gamma Coatings Regions...");
      const regionNames = ["Nairobi", "Central", "Coast", "Eastern", "North Eastern", "Nyanza", "Rift Valley", "Western"];
      const insertedRegions = [];
      for (const name of regionNames) {
        const [r] = await db.insert(schema.regions).values({
          tenantId: gammaTenant.id,
          countryId: kenya.id,
          name,
        }).onConflictDoNothing().returning();
        if (r) {
          insertedRegions.push(r);
        } else {
          const existingReg = await db.query.regions.findFirst({
            where: and(eq(schema.regions.tenantId, gammaTenant.id), eq(schema.regions.name, name))
          });
          if (existingReg) insertedRegions.push(existingReg);
        }
      }

      const rvRegion = insertedRegions.find(r => r.name === "Rift Valley");
      if (rvRegion) {
        console.log("📍 Seeding Gamma Coatings Rift Valley Towns...");
        const rvTowns = ["Nakuru", "Eldoret", "Naivasha", "Kitale", "Kericho"];
        for (const name of rvTowns) {
          await db.insert(schema.towns).values({
            tenantId: gammaTenant.id,
            regionId: rvRegion.id,
            name,
          }).onConflictDoNothing();
        }
      }

      console.log("📦 Seeding Gamma Coatings Products...");
      const [gammaProduct] = await db.insert(schema.products).values({
        tenantId: gammaTenant.id,
        sku: "GAMMA-SILK-4L",
        name: "Gamma Silk Paint 4L",
        category: "Paints",
        pointsPerUnit: 50,
        price: "50.00",
        isActive: true,
      }).onConflictDoNothing().returning();

      const resolvedProduct = gammaProduct || await db.query.products.findFirst({
        where: and(eq(schema.products.tenantId, gammaTenant.id), eq(schema.products.sku, "GAMMA-SILK-4L"))
      });

      if (resolvedProduct) {
        console.log("🎫 Seeding Gamma Coatings Voucher Batch & Vouchers...");
        const [batch] = await db.insert(schema.voucherBatches).values({
          tenantId: gammaTenant.id,
          productId: resolvedProduct.id,
          batchNumber: "GAMMA-BATCH-001",
          quantity: 10,
          generated: 10,
          isActivated: true,
          activatedAt: new Date(),
        }).onConflictDoNothing().returning();

        const resolvedBatch = batch || await db.query.voucherBatches.findFirst({
          where: and(eq(schema.voucherBatches.tenantId, gammaTenant.id), eq(schema.voucherBatches.batchNumber, "GAMMA-BATCH-001"))
        });

        if (resolvedBatch) {
          const testVouchers = [
            { code: "G-ACTIVE-1", status: "ACTIVE" as const },
            { code: "G-ACTIVE-2", status: "ACTIVE" as const },
            { code: "G-USED-1", status: "REDEEMED" as const },
          ];

          for (const item of testVouchers) {
            const secureCodeHash = crypto.createHash("sha256").update(item.code).digest("hex");
            await db.insert(schema.vouchers).values({
              batchId: resolvedBatch.id,
              serialNumber: "SN-" + item.code,
              secureCodeHash,
              status: item.status,
            }).onConflictDoNothing();
          }
        }
      }
    }
  } // <-- Closing the process.env.NODE_ENV check

  console.log("✅ Seeding completed successfully!");
  console.log("\n🚀 SYSTEM READY:");
    console.log("1. System Admin: admin@tuzohub.com / TuzoHub1.$");
    if (process.env.NODE_ENV !== "production") {
      console.log("2. Jopiny Admin: admin@jopinypaints.com / Jopiny2026!");
    }
    console.log("\n💡 You can now login to the dashboard immediately.");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
