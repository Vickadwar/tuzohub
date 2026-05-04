import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { OfflineSyncService } from "../../services/offline-sync.service";
import { withScopedDb } from "../../db";

const app = new Hono<{ Variables: { user: any } }>();

const syncSchema = z.object({
  deviceId: z.string().min(1),
  idempotencyKey: z.string().optional(),
  payload: z.any()
});

app.post("/enqueue", zValidator("json", syncSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  // Endpoint hit by the Android POS when it reconnects to internet
  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await OfflineSyncService.enqueuePayload(user.tenantId, body.deviceId, body.payload, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Admin endpoint to manually trigger runner (Normally done via cron)
app.post("/trigger", async (c) => {
  const user = c.get("user");
  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await OfflineSyncService.processQueue(user.tenantId, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
