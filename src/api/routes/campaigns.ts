import { Hono } from "hono";
import { CampaignService } from "../../services/campaign.service";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const app = new Hono<{ Variables: { user: any } }>();

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  campaignType: z.string().min(1, "Campaign type is required"),
  pointsMultiplier: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  isRecurring: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/campaigns
 */
app.get("/", async (c) => {
  const user = c.get("user");
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "10");
  const search = c.req.query("search");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant not found" }, 403);
  }

  try {
    const result = await CampaignService.listCampaigns({
      tenantId: user.tenantId,
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
  const user = c.get("user");
  const body = c.req.valid("json");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant not found" }, 403);
  }

  try {
    const campaign = await CampaignService.createCampaign({
      ...body,
      tenantId: user.tenantId,
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
  const user = c.get("user");
  const id = c.req.param("id");

  try {
    const campaign = await CampaignService.getCampaign(id, user.tenantId);
    return c.json({ success: true, data: campaign });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 404);
  }
});

/**
 * PATCH /api/campaigns/:id
 */
app.patch("/:id", zValidator("json", campaignSchema.partial()), async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = c.req.valid("json");

  try {
    const campaign = await CampaignService.updateCampaign(id, user.tenantId, body as any);
    return c.json({ success: true, data: campaign });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * GET /api/campaigns/:id/products
 */
app.get("/:id/products", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  try {
    // Verify ownership first
    await CampaignService.getCampaign(id, user.tenantId);
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
  const user = c.get("user");
  const id = c.req.param("id");
  const { productId } = c.req.valid("json");

  try {
    // Verify ownership
    await CampaignService.getCampaign(id, user.tenantId);
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
  const user = c.get("user");
  const id = c.req.param("id");
  const productId = c.req.param("productId");

  try {
    // Verify ownership
    await CampaignService.getCampaign(id, user.tenantId);
    await CampaignService.unlinkProduct(id, productId);
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
