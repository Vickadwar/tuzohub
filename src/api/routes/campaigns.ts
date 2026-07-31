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
  let tenantId = c.req.query("tenantId") || c.get("user")?.tenantId;
  if (tenantId) return tenantId;

  const authHeader = c.req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, user.id)
        });
        if (dbUser?.tenantId) return dbUser.tenantId;
      }
    } catch (e) {
      console.warn("[Campaigns resolveTenantId] Auth token error:", e);
    }
  }

  // Fallback to first available tenant in DB
  const firstTenant = await db.query.tenants.findFirst();
  return firstTenant?.id || null;
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
app.patch("/:id", zValidator("json", campaignSchema.partial()), async (c) => {
  const tenantId = await resolveTenantId(c);
  const id = c.req.param("id");
  const body = c.req.valid("json");

  if (!tenantId) {
    return c.json({ success: false, error: "Tenant reference not found" }, 403);
  }

  try {
    const campaign = await CampaignService.updateCampaign(id, tenantId, body as any);
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
