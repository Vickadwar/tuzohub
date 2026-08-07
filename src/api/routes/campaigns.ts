import { Hono, Context } from "hono";
import { CampaignService } from "../../services/campaign.service";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "../../db";
import { tenants, users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { supabase } from "../../lib/supabase";

const app = new Hono<{ Variables: { user: any } }>();

async function resolveTenantId(c: Context) {
  const user = c.get("user");

  // Allow SYSTEM_ADMIN to explicitly scope to a tenant via query param
  if (user?.role === "SYSTEM_ADMIN" && c.req.query("tenantId")) {
    return c.req.query("tenantId");
  }

  if (user?.tenantId) {
    return user.tenantId;
  }

  const authHeader = c.req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const { data: { user: authUser } } = await supabase.auth.getUser(token);
      if (authUser) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, authUser.id)
        });
        if (dbUser?.tenantId) return dbUser.tenantId;
      }
    } catch (e) {
      console.warn("[Campaigns resolveTenantId] Auth token error:", e);
    }
  }

  return null;
}

const ruleConfigSchema = z.object({
  fulfillmentMode: z.enum(["POINTS_ACCUMULATION", "INSTANT_PAYOUT", "VOUCHER_GENERATE"]).optional(),
  payoutRewardType: z.enum(["MOBILE_MONEY", "AIRTIME", "CATALOG_POINTS", "SHOPPING_VOUCHER"]).optional(),
  valuationStrategy: z.enum(["PRODUCT_BASE_MULTIPLIER", "FLAT_FIXED_REWARD"]).optional(),
  instantCashAmount: z.number().optional(),
  pointsPerScan: z.number().optional(),
  dailyScanLimit: z.number().optional(),
  totalBudgetCap: z.number().optional(),
  channels: z.array(z.string()).optional(),
  productIds: z.array(z.string()).optional(),
  webhookUrl: z.string().optional(),
  entryRules: z.record(z.string(), z.any()).optional(),
}).optional();

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  campaignType: z.string().min(1, "Campaign type is required"),
  fulfillmentMode: z.enum(["INSTANT", "ACCUMULATION", "HYBRID"]).optional(),
  instantRewardType: z.enum(["CASHBACK", "AIRTIME", "MOBILE_DATA", "SHOPPING_VOUCHER"]).optional().nullable(),
  instantValue: z.union([z.string(), z.number()]).optional().nullable(),
  pointsMultiplier: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  isRecurring: z.boolean().optional(),
  isActive: z.boolean().optional(),
  ruleConfig: ruleConfigSchema,
});

/**
 * GET /api/campaigns
 */
app.get("/", async (c) => {
  const tenantId = await resolveTenantId(c);
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "50");
  const search = c.req.query("search");

  if (!tenantId) {
    return c.json({ success: false, error: "Tenant reference not found" }, 403);
  }

  try {
    const result = await CampaignService.listCampaigns({
      tenantId,
      page,
      limit,
      search,
    });
    return c.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * POST /api/campaigns
 */
app.post("/", zValidator("json", campaignSchema), async (c) => {
  const tenantId = await resolveTenantId(c);
  const body = c.req.valid("json");

  if (!tenantId) {
    return c.json({ success: false, error: "Tenant reference not found" }, 403);
  }

  try {
    const campaign = await CampaignService.createCampaign({
      ...body,
      tenantId,
    } as any);
    return c.json({ success: true, data: campaign });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * GET /api/campaigns/:id
 */
app.get("/:id", async (c) => {
  const tenantId = await resolveTenantId(c);
  const id = c.req.param("id");

  if (!tenantId) {
    return c.json({ success: false, error: "Tenant reference not found" }, 403);
  }

  try {
    const campaign = await CampaignService.getCampaign(id, tenantId);
    return c.json({ success: true, data: campaign });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 404);
  }
});

/**
 * PATCH /api/campaigns/:id
 */
app.patch("/:id", async (c) => {
  const tenantId = await resolveTenantId(c);
  const id = c.req.param("id");

  if (!tenantId) {
    return c.json({ success: false, error: "Tenant reference not found" }, 403);
  }

  try {
    const body = await c.req.json();
    const campaign = await CampaignService.updateCampaign(id, tenantId, body);
    return c.json({ success: true, data: campaign });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * GET /api/campaigns/:id/products
 */
app.get("/:id/products", async (c) => {
  const tenantId = await resolveTenantId(c);
  const id = c.req.param("id");

  if (!tenantId) {
    return c.json({ success: false, error: "Tenant reference not found" }, 403);
  }

  try {
    await CampaignService.getCampaign(id, tenantId);
    const products = await CampaignService.listLinkedProducts(id);
    return c.json({ success: true, data: products });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 404);
  }
});

/**
 * POST /api/campaigns/:id/products
 */
app.post("/:id/products", zValidator("json", z.object({ productId: z.string().uuid() })), async (c) => {
  const tenantId = await resolveTenantId(c);
  const id = c.req.param("id");
  const { productId } = c.req.valid("json");

  if (!tenantId) {
    return c.json({ success: false, error: "Tenant reference not found" }, 403);
  }

  try {
    await CampaignService.getCampaign(id, tenantId);
    await CampaignService.linkProduct(id, productId);
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * DELETE /api/campaigns/:id/products/:productId
 */
app.delete("/:id/products/:productId", async (c) => {
  const tenantId = await resolveTenantId(c);
  const id = c.req.param("id");
  const productId = c.req.param("productId");

  if (!tenantId) {
    return c.json({ success: false, error: "Tenant reference not found" }, 403);
  }

  try {
    await CampaignService.getCampaign(id, tenantId);
    await CampaignService.unlinkProduct(id, productId);
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
