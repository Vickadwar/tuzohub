import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { ReferralService } from "../../services/referral.service";
import { withScopedDb } from "../../db";

const app = new Hono<{ Variables: { user: any } }>();

app.post("/:consumerId/generate", async (c) => {
  const user = c.get("user");
  const consumerId = c.req.param("consumerId");

  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      const code = await ReferralService.generateReferralCodeForConsumer(consumerId, tx);
      return { code };
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

const applyReferralSchema = z.object({
  code: z.string().min(1),
  consumerId: z.string().uuid(),
});

app.post("/apply", zValidator("json", applyReferralSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await ReferralService.applyReferralCode(user.tenantId, body.consumerId, body.code, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
