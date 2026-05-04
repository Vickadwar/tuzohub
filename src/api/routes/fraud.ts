import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { FraudService } from "../../services/fraud.service";
import { withScopedDb } from "../../db";

const app = new Hono<{ Variables: { user: any } }>();

app.get("/rules", async (c) => {
  const user = c.get("user");
  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await FraudService.getRules(user.tenantId, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

const ruleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  ruleType: z.string().min(1),
  severity: z.enum(["LOG", "FLAG", "BLOCK", "REQUIRE_REVIEW"]),
  configuration: z.any(),
});

app.post("/rules", zValidator("json", ruleSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await FraudService.createRule({ ...body, tenantId: user.tenantId }, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.get("/alerts", async (c) => {
  const user = c.get("user");
  const status = (c.req.query("status") as any) || "OPEN";

  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await FraudService.getAlerts(user.tenantId, status, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

const resolveSchema = z.object({
  status: z.enum(["RESOLVED", "FALSE_POSITIVE"]),
  resolutionNote: z.string().min(1),
});

app.post("/alerts/:id/resolve", zValidator("json", resolveSchema), async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = c.req.valid("json");

  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await FraudService.resolveAlert(id, user.tenantId, user.userId, body.status, body.resolutionNote, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
