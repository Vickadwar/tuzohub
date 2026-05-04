import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { WebhookService } from "../../services/webhook.service";
import { withScopedDb } from "../../db";

const app = new Hono<{ Variables: { user: any } }>();

// GET /api/webhooks
app.get("/", async (c) => {
  const user = c.get("user");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant context missing" }, 403);
  }

  if (user.role !== "TENANT_ADMIN" && user.role !== "SYSTEM_ADMIN" && user.role !== "service_role") {
    return c.json({ success: false, error: "Forbidden: Admin access required" }, 403);
  }

  try {
    const webhooks = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await WebhookService.getTenantWebhooks(user.tenantId, tx);
    });
    return c.json({ success: true, data: webhooks });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /api/webhooks
const createWebhookSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  eventTypes: z.array(z.string()).min(1),
});

app.post("/", zValidator("json", createWebhookSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant context missing" }, 403);
  }

  if (user.role !== "TENANT_ADMIN" && user.role !== "SYSTEM_ADMIN" && user.role !== "service_role") {
    return c.json({ success: false, error: "Forbidden: Admin access required" }, 403);
  }

  try {
    const webhook = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await WebhookService.createWebhook(user.tenantId, body, tx);
    });
    return c.json({ success: true, data: webhook });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
