import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { PartnerService } from "../../services/partner.service";
import { withScopedDb } from "../../db";

const app = new Hono<{ Variables: { user: any } }>();

// GET /api/partners
app.get("/", async (c) => {
  const user = c.get("user");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant context missing" }, 403);
  }

  if (user.role !== "TENANT_ADMIN" && user.role !== "SYSTEM_ADMIN" && user.role !== "service_role") {
    return c.json({ success: false, error: "Forbidden: Admin access required" }, 403);
  }

  try {
    const partners = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await PartnerService.getTenantPartnerPrograms(user.tenantId, tx);
    });
    return c.json({ success: true, data: partners });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /api/partners
const createPartnerSchema = z.object({
  partnerTenantId: z.string().uuid(),
  name: z.string().min(1),
  exchangeRate: z.string().regex(/^\d+(\.\d+)?$/),
  startDate: z.string().datetime({ offset: true }),
  endDate: z.string().datetime({ offset: true }).optional(),
});

app.post("/", zValidator("json", createPartnerSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant context missing" }, 403);
  }

  if (user.role !== "TENANT_ADMIN" && user.role !== "SYSTEM_ADMIN" && user.role !== "service_role") {
    return c.json({ success: false, error: "Forbidden: Admin access required" }, 403);
  }

  try {
    const partner = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await PartnerService.createPartnerProgram(user.tenantId, body, tx);
    });
    return c.json({ success: true, data: partner });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
