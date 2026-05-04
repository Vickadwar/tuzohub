import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { GamificationService } from "../../services/gamification.service";
import { withScopedDb } from "../../db";

const app = new Hono<{ Variables: { user: any } }>();

const challengeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  goalType: z.enum(["TRANSACTION_COUNT", "SPEND_AMOUNT", "REFERRAL_COUNT", "PRODUCT_PURCHASE"]),
  goalValue: z.string().min(1),
  rewardPoints: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
});

app.post("/challenges", zValidator("json", challengeSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await GamificationService.createChallenge({
        ...body,
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

app.get("/challenges", async (c) => {
  const user = c.get("user");
  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await GamificationService.getActiveChallenges(user.tenantId, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

const badgeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  criteria: z.any().optional(),
});

app.post("/badges", zValidator("json", badgeSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await GamificationService.createBadge({ ...body, tenantId: user.tenantId }, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
