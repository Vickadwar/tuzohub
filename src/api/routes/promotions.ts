import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { PromotionService } from "../../services/promotion.service";
import { withScopedDb } from "../../db";

const app = new Hono<{ Variables: { user: any } }>();

const promoSchema = z.object({
  name: z.string().min(1),
  promotionType: z.enum(["BUY_X_GET_Y", "PERCENTAGE_DISCOUNT", "FIXED_DISCOUNT", "FREE_SHIPPING", "BUNDLE", "LOYALTY_MULTIPLIER"]),
  stackingType: z.enum(["NONE", "COMPOUND", "BEST_PRICE", "SEQUENTIAL"]).optional(),
  priority: z.number().int().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  configuration: z.any(),
  usageLimitTotal: z.number().int().optional(),
  minCartValue: z.number().optional(),
  applicableProducts: z.array(z.string()).optional(),
});

app.post("/", zValidator("json", promoSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await PromotionService.createPromotion({
        ...body,
        minCartValue: body.minCartValue ? String(body.minCartValue) : null,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        tenantId: user.tenantId
      }, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.get("/", async (c) => {
  const user = c.get("user");
  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await PromotionService.getActivePromotions(user.tenantId, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
