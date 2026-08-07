import { db } from "./src/db";
import { tenantSettings, tenants } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  const allSettings = await db.select().from(tenantSettings);
  console.log(`Found ${allSettings.length} tenant settings.`);
  
  for (const setting of allSettings) {
    const tenant = await db.select().from(tenants).where(eq(tenants.id, setting.tenantId)).limit(1).then(r => r[0]);
    const creds = (setting.credentials || {}) as any;
    const primarySc = (setting.primaryShortcode || creds.ussdServiceCode || creds.serviceCode || "").replace(/[^0-9*]/g, "");
    const subPrefix = (setting.sharedSubPrefix || "").replace(/[^0-9*]/g, "");
    
    console.log(`Tenant: ${tenant?.slug} | DB Strategy: ${setting.ussdHandlerStrategy} | PrimarySC (Cleaned): '${primarySc}' | SubPrefix (Cleaned): '${subPrefix}'`);
  }
}
run().then(() => process.exit(0)).catch(console.error);
