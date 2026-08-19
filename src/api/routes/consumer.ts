import { Hono } from "hono";
import { ConsumerService } from "../../services/consumer.service";
import { db, withScopedDb } from "../../db";
import { tenantSettings, tenants } from "../../db/schema";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const app = new Hono<{ Variables: { user: any } }>();

// GET /api/consumers - List all for tenant
app.get("/", async (c) => {
  const user = c.get("user");
  if (!user.tenantId) return c.json({ success: false, error: "Tenant not found" }, 403);
  
  try {
    const data = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await ConsumerService.listConsumers(user.tenantId, tx);
    });
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /api/consumers/search?query=...
app.get("/search", async (c) => {
  const user = c.get("user");
  const query = c.req.query("query") || "";

  let tenantId: string = c.req.query("tenantId") || user?.tenantId;
  if (!tenantId) {
    const allSettings = await db.select().from(tenantSettings);
    const configured = allSettings.find((s: any) => (s.credentials as any)?.darajaConsumerKey);
    tenantId = configured?.tenantId || (await db.query.tenants.findFirst())?.id as string;
  }

  try {
    const data = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await ConsumerService.searchConsumers(tenantId, query, tx);
    });
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /api/consumers - Create new
const SAFARICOM_REGEX = /^(?:254|\+254|0)?(7(?:0|1|2|4|6|9)|11(?:0|1|2|3|4|5))[0-9]{7}$/;
const NATIONAL_ID_REGEX = /^[0-9]{6,8}$/;

const createConsumerSchema = z.object({
  phoneNumber: z.string().regex(SAFARICOM_REGEX, "Must be a valid Safaricom number"),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  secondName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  idNumber: z.string().regex(NATIONAL_ID_REGEX, "ID must be 6-8 digits").optional().nullable(),
  taxPin: z.string().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  townId: z.string().uuid().optional().nullable(),
  consumerType: z.string().optional().default("END_USER"),
  onboardedByAgentId: z.string().uuid().optional().nullable(),
  physicalTagId: z.string().optional().nullable(),
});

app.post("/", zValidator("json", createConsumerSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  try {
    const data = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await ConsumerService.createConsumer(user.tenantId, body, tx);
    });
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// GET /api/consumers/dashboard/:id
app.get("/dashboard/:id", async (c) => {
  const user = c.get("user");
  const consumerId = c.req.param("id");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant not found" }, 403);
  }

  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "10");

  try {
    const dashboard = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await ConsumerService.getDashboard(
        user.tenantId,
        consumerId,
        { page, limit },
        tx
      );
    });

    return c.json({
      success: true,
      data: dashboard,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// GET /api/consumers/profile/:id
app.get("/profile/:id", async (c) => {
  const user = c.get("user");
  const consumerId = c.req.param("id");

  try {
    const profile = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await ConsumerService.getProfile(consumerId, tx);
    });

    return c.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// PUT /api/consumers/profile/:id - Update profile
const updateProfileSchema = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  secondName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phoneNumber: z.string().regex(SAFARICOM_REGEX, "Must be a valid Safaricom number").optional(),
  idNumber: z.string().regex(NATIONAL_ID_REGEX, "ID must be 6-8 digits").optional().nullable(),
  taxPin: z.string().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  townId: z.string().uuid().optional().nullable(),
  dealerOrganizationId: z.string().uuid().optional().nullable(),
  onboardedByAgentId: z.string().uuid().optional().nullable(),
  consumerType: z.string().optional().nullable(),
  physicalTagId: z.string().optional().nullable(),
  identificationImageUrl: z.string().optional().nullable(),
  loyaltyTierId: z.string().uuid().optional().nullable(),
  preferredLanguage: z.string().optional().nullable(),
  preferredChannel: z.enum(["USSD", "WEB", "MOBILE_APP", "SMS", "POS", "WHATSAPP"]).optional().nullable(),
  preferredCategory: z.string().optional().nullable(),
});

app.put("/profile/:id", zValidator("json", updateProfileSchema), async (c) => {
  const user = c.get("user");
  const consumerId = c.req.param("id");
  const body = c.req.valid("json");

  try {
    const data = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await ConsumerService.updateProfile(consumerId, body, tx);
    });
    return c.json({ success: true, data });
  } catch (error: any) {
    console.error(`[Update Profile Error] consumerId: ${consumerId}`, error);
    return c.json({ success: false, error: error.message }, 400);
  }
});

// PATCH /api/consumers/controls/:id - Update feature toggles, limits, consent and capabilities
const updateControlsSchema = z.object({
  // Redemption Controls & Limits
  redemptionEnabled: z.boolean().optional(),
  redemptionDailyLimit: z.union([z.number(), z.string()]).transform(v => v !== null && v !== undefined && v !== "" ? String(v) : null).nullable().optional(),
  redemptionWeeklyLimit: z.union([z.number(), z.string()]).transform(v => v !== null && v !== undefined && v !== "" ? String(v) : null).nullable().optional(),
  redemptionMonthlyLimit: z.union([z.number(), z.string()]).transform(v => v !== null && v !== undefined && v !== "" ? String(v) : null).nullable().optional(),
  redemptionSingleMaxPoints: z.union([z.number(), z.string()]).transform(v => v !== null && v !== undefined && v !== "" ? String(v) : null).nullable().optional(),
  redemptionRequiresApproval: z.boolean().optional(),
  redemptionBlockedReason: z.string().nullable().optional(),

  // Banking Controls
  bankingEnabled: z.boolean().optional(),
  autoBankingThreshold: z.union([z.number(), z.string()]).transform(v => v !== null && v !== undefined && v !== "" ? String(v) : null).nullable().optional(),
  bankingWithdrawMinPoints: z.union([z.number(), z.string()]).transform(v => v !== null && v !== undefined && v !== "" ? String(v) : null).nullable().optional(),

  // Granular Locks & Capabilities
  canPurchase: z.boolean().optional(),
  canEarnPoints: z.boolean().optional(),
  canRedeemPoints: z.boolean().optional(),
  canBankPoints: z.boolean().optional(),
  canTransferPoints: z.boolean().optional(),
  canReceiveGifts: z.boolean().optional(),
  canParticipateInCampaigns: z.boolean().optional(),

  // Marketing & Opt-in Consent Flags
  marketingOptIn: z.boolean().optional(),
  smsOptIn: z.boolean().optional(),
  emailOptIn: z.boolean().optional(),
  pushOptIn: z.boolean().optional(),

  // Security & KYC flags
  isVerified: z.boolean().optional(),
  hasPortalAccess: z.boolean().optional(),
  riskScore: z.number().int().min(0).max(100).optional(),
});

app.patch("/controls/:id", zValidator("json", updateControlsSchema), async (c) => {
  const user = c.get("user");
  const consumerId = c.req.param("id");
  const body = c.req.valid("json");

  try {
    const data = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await ConsumerService.updateControls(consumerId, body, tx);
    });
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// POST /api/consumers/security/pin/:id - Set USSD PIN
const setPinSchema = z.object({
  pin: z.string().min(4).max(6),
});

app.post("/security/pin/:id", zValidator("json", setPinSchema), async (c) => {
  const user = c.get("user");
  const consumerId = c.req.param("id");
  const { pin } = c.req.valid("json");

  try {
    await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await ConsumerService.setUssdPin(consumerId, pin, tx);
    });
    return c.json({ success: true, message: "PIN updated successfully" });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// POST /api/consumers/status/:id - Change status
const setStatusSchema = z.object({
  status: z.enum(["active", "suspended", "blocked"]),
  reason: z.string().optional(),
});

app.post("/status/:id", zValidator("json", setStatusSchema), async (c) => {
  const user = c.get("user");
  const consumerId = c.req.param("id");
  const body = c.req.valid("json");

  try {
    await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await ConsumerService.setStatus(consumerId, body.status, body.reason, tx);
    });
    return c.json({ success: true, message: `Status updated to ${body.status}` });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});


// GET /api/consumers/:id/activity/:identifier
app.get("/:id/activity/:identifier", async (c) => {
  const user = c.get("user");
  const consumerId = c.req.param("id");
  const identifier = c.req.param("identifier");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant not found" }, 403);
  }

  try {
    const journey = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await ConsumerService.getActivityJourney(user.tenantId, consumerId, identifier, tx);
    });

    return c.json({
      success: true,
      data: journey,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
