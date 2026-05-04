import { Hono } from "hono";
import { VoucherService } from "../../services/voucher.service";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

type Variables = {
  user: {
    userId: string;
    tenantId: string;
    role: string;
  }
};

const app = new Hono<{ Variables: Variables }>();

const voucherBatchSchema = z.object({
  productId: z.string().uuid().optional(),   // not required at voucher creation
  campaignId: z.string().uuid().optional(),
  batchNumber: z.string().min(1, "Batch reference is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(5000),
  expiryDate: z.string().optional().transform(s => s ? new Date(s) : undefined),
});

/**
 * GET /api/vouchers/batches
 */
app.get("/batches", async (c) => {
  const user = c.get("user");
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "10");

  try {
    const result = await VoucherService.listBatches(user.tenantId, page, limit);
    return c.json({ success: true, ...result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * POST /api/vouchers/batches
 */
app.post("/batches", zValidator("json", voucherBatchSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  try {
    const result = await VoucherService.generateBatch({
      ...body,
      tenantId: user.tenantId,
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * POST /api/vouchers/batches/:id/activate
 */
app.post("/batches/:id/activate", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  try {
    const batch = await VoucherService.activateBatch(id, user.tenantId, user.userId);
    return c.json({ success: true, data: batch });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * PATCH /api/vouchers/batches/:id/status
 */
app.patch("/batches/:id/status", zValidator("json", z.object({ status: z.string() })), async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = c.req.valid("json");

  try {
    const batch = await VoucherService.updateBatchStatus(id, user.tenantId, body.status);
    return c.json({ success: true, data: batch });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * GET /api/vouchers?batchId=&status=&page=&limit=
 * Lists individual vouchers for this tenant.
 */
app.get("/", async (c) => {
  const user = c.get("user");
  const batchId = c.req.query("batchId");
  const status  = c.req.query("status");
  const page    = parseInt(c.req.query("page")  || "1");
  const limit   = parseInt(c.req.query("limit") || "50");

  try {
    const result = await VoucherService.listVouchers({ tenantId: user.tenantId, batchId, status, page, limit });
    return c.json({ success: true, ...result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * GET /api/vouchers/:id
 * Returns a single voucher (no secret code).
 */
app.get("/:id", async (c) => {
  const user = c.get("user");
  const id   = c.req.param("id");

  try {
    const voucher = await VoucherService.getVoucher(id, user.tenantId);
    if (!voucher) return c.json({ success: false, error: "Voucher not found" }, 404);
    return c.json({ success: true, data: voucher });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
