import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { TenantService } from "../../services/tenant.service";
import { withScopedDb } from "../../db";

const app = new Hono<{ Variables: { user: any } }>();

// GET /api/tenants/me — Returns the current user's tenant
app.get("/me", async (c) => {
  const user = c.get("user");
  if (!user.tenantId) {
    return c.json({ success: false, error: "No tenant associated with this user" }, 400);
  }

  try {
    const tenantData = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await TenantService.getTenantById(user.tenantId, tx);
    });
    return c.json({ success: true, data: tenantData });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 404);
  }
});

// GET /api/tenants/countries — Global master data (no tenant scoping)
app.get("/countries", async (c) => {
  const user = c.get("user");
  try {
    const data = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await TenantService.getCountries(tx);
    });
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// GET /api/tenants/currencies — Global master data
app.get("/currencies", async (c) => {
  const user = c.get("user");
  try {
    const data = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await TenantService.getCurrencies(tx);
    });
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// GET /api/tenants/channels — Tenant deployed channels
app.get("/channels", async (c) => {
  const user = c.get("user");
  if (!user.tenantId) {
    return c.json({ success: false, error: "No tenant associated with this user" }, 400);
  }
  try {
    const data = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await TenantService.getTenantChannels(user.tenantId, tx);
    });
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// GET /api/tenants/:slug
app.get("/:slug", async (c) => {
  const user = c.get("user");
  const slug = c.req.param("slug");

  try {
    const tenantData = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await TenantService.getTenantBySlug(slug, tx);
    });
    return c.json({ success: true, data: tenantData });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 404);
  }
});

// PUT /api/tenants/:slug/settings
const updateSettingsSchema = z.object({
  // Base tenant fields
  baseCurrency: z.string().length(3).optional(),
  defaultPointValue: z.string().optional(),
  pointExpiryMonths: z.number().int().optional(),

  // Redemption settings
  redemptionRequiresApproval: z.boolean().optional(),
  redemptionMinPoints: z.string().optional(),
  redemptionMaxPerDay: z.string().optional(),
  redemptionMaxPerWeek: z.string().optional(),
  redemptionMaxPerMonth: z.string().optional(),
  redemptionTimeWindowMinutes: z.number().int().optional(),

  // Banking & Expiry
  pointExpiryEnabled: z.boolean().optional(),
  pointExpiryMonthsGlobal: z.number().int().optional(),
  pointRolloverEnabled: z.boolean().optional(),
  rolloverMaxPercentage: z.number().int().optional(),

  // Consumer controls
  defaultCanPurchase: z.boolean().optional(),
  defaultCanEarnPoints: z.boolean().optional(),
  defaultCanRedeemPoints: z.boolean().optional(),
  defaultCanBankPoints: z.boolean().optional(),
  defaultCanTransferPoints: z.boolean().optional(),

  // Fraud & Security
  maxFailedRedemptionsPerHour: z.number().int().optional(),
  requireMfaForRedemption: z.boolean().optional(),
  redemptionVelocityCheckMinutes: z.number().int().optional(),
  maxPointsEarnedPerDay: z.string().optional(),

  // Branding
  brandPrimaryColor: z.string().optional(),
  brandLogoUrl: z.string().optional(),
  smsSenderId: z.string().optional(),
  emailFooterHtml: z.string().optional(),

  // Compliance
  auditLogRetentionDays: z.number().int().optional(),
  consumerDataRetentionDays: z.number().int().optional(),

  // External Credentials
  credentials: z.record(z.string(), z.any()).optional(),
});

app.put("/:slug/settings", zValidator("json", updateSettingsSchema), async (c) => {
  const user = c.get("user");
  const slug = c.req.param("slug");
  const body = c.req.valid("json");

  // Only TENANT_ADMIN or SYSTEM_ADMIN should update settings
  if (user.role !== "TENANT_ADMIN" && user.role !== "SYSTEM_ADMIN" && user.role !== "service_role") {
    return c.json({ success: false, error: "Forbidden: Admin access required" }, 403);
  }

  try {
    const updated = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await TenantService.updateTenantSettings(slug, body, tx);
    });
    return c.json({ success: true, data: updated });
  } catch(error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
