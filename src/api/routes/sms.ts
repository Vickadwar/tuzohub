import { Hono } from "hono";
import { db } from "../../db";
import { consumers, tenantSettings } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { SmsService } from "../../services/sms.service";
import { WalletRepository } from "../../services/../db/repositories/wallet.repo";
import { tenants } from "../../db/schema";

const app = new Hono();

/**
 * Africa's Talking SMS Callback Handler
 * POST https://yourdomain.com/api/sms/callback?tenantId=<uuid>
 * 
 * Fields from AT:
 *   from  - phone number
 *   to    - short code
 *   text  - message body
 *   date  - timestamp
 *   id    - message id
 */
app.post("/callback", async (c) => {
  const body = await c.req.parseBody();
  const from = body["from"] as string;
  const text = body["text"] as string;
  const tenantId = c.req.query("tenantId");

  if (!tenantId) return c.text("Missing tenantId", 400);

  console.log(`[SMS] From: ${from}, Text: "${text}"`);

  // 1. Fetch Tenant Settings for API keys
  const tSettingsRecords = await db.select().from(tenantSettings).where(eq(tenantSettings.tenantId, tenantId)).limit(1);
  const tSettings = tSettingsRecords[0];
  const creds = tSettings?.credentials as any;

  // 2. Normalize Phone
  let normalizedPhone = from.replace(/\s/g, "");
  if (normalizedPhone.startsWith("+254")) normalizedPhone = "0" + normalizedPhone.slice(4);
  else if (normalizedPhone.startsWith("254")) normalizedPhone = "0" + normalizedPhone.slice(3);

  // 3. Find or Create Consumer
  const existing = await db.query.consumers.findFirst({
    where: and(eq(consumers.phoneNumber, normalizedPhone), eq(consumers.tenantId, tenantId)),
  });

  if (!existing) {
    // AUTO-REGISTRATION with dummy name
    const newId = uuidv4();
    await db.transaction(async (tx) => {
      await tx.insert(consumers).values({
        id: newId,
        tenantId,
        phoneNumber: normalizedPhone,
        loyaltyNumber: "TZ" + Math.floor(100000 + Math.random() * 900000),
        firstName: "Guest",
        lastName: "Member",
        isRegistered: false,
        status: "active",
      });

      // ── CREATE WALLET ─────────────────────────────────────────────
      const [tenant] = await tx.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
      await WalletRepository.create({
        tenantId,
        ownerId: newId,
        ownerType: "CONSUMER",
        currencyCode: tenant?.baseCurrency || "KES",
      }, tx);
    });

    // 4. Send Welcome SMS with T&C URL
    if (creds?.atApiKey) {
      const welcomeMsg = `Welcome to TuZo Hub! You've been registered. To complete your profile, dial our USSD code. Terms: https://tuzohub.com/terms`;
      await SmsService.sendSms({
        config: { username: creds.atUsername, apiKey: creds.atApiKey, senderId: creds.atSenderId },
        to: from,
        message: welcomeMsg,
      }).catch(err => console.error("Auto-reg welcome SMS failed", err));
    }
  } else if (!existing.isRegistered) {
     // If they exist but aren't registered, remind them
     if (creds?.atApiKey) {
        await SmsService.sendSms({
            config: { username: creds.atUsername, apiKey: creds.atApiKey, senderId: creds.atSenderId },
            to: from,
            message: `Hi! To complete your TuZo Hub registration, please dial our USSD code or visit our website.`,
        }).catch(err => console.error("Remind SMS failed", err));
     }
  }

  return c.text("OK");
});

export default app;
