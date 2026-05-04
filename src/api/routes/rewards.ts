import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { RewardService } from "../../services/reward.service";
import { withScopedDb } from "../../db";

const app = new Hono<{ Variables: { user: any } }>();

// GET /api/rewards/catalog
app.get("/catalog", async (c) => {
  const user = c.get("user");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant context missing" }, 403);
  }

  try {
    const catalog = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await RewardService.getRewardsCatalog(user.tenantId, tx);
    });
    return c.json({ success: true, data: catalog });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /api/rewards/categories
const createCategorySchema = z.object({
  name: z.string().min(1),
  displayOrder: z.number().int().optional(),
});

app.post("/categories", zValidator("json", createCategorySchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant context missing" }, 403);
  }

  if (user.role !== "TENANT_ADMIN" && user.role !== "SYSTEM_ADMIN" && user.role !== "service_role") {
    return c.json({ success: false, error: "Forbidden: Admin access required" }, 403);
  }

  try {
    const category = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await RewardService.createCategory(user.tenantId, body, tx);
    });
    return c.json({ success: true, data: category });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// POST /api/rewards/items
const createItemSchema = z.object({
  categoryId: z.string().uuid().nullable().optional(),
  name: z.string().min(1),
  rewardType: z.enum(["AIRTIME", "MOBILE_MONEY", "BANK_TRANSFER", "INTERNAL_VOUCHER", "PHYSICAL", "CASH", "GIFT_CARD"]),
  fulfillmentStrategy: z.enum(["AUTOMATED_PAYOUT", "INTERNAL_VOUCHER", "MANUAL_FULFILLMENT", "WALLET_BANKING"]),
  requiredPoints: z.string(),
});

app.post("/items", zValidator("json", createItemSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant context missing" }, 403);
  }

  if (user.role !== "TENANT_ADMIN" && user.role !== "SYSTEM_ADMIN" && user.role !== "service_role") {
    return c.json({ success: false, error: "Forbidden: Admin access required" }, 403);
  }

  try {
    const rewardItem = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await RewardService.createRewardItem(
        user.tenantId,
        body.categoryId || null,
        body,
        tx
      );
    });
    return c.json({ success: true, data: rewardItem });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
