import { Hono } from "hono";
import { VoucherService } from "../../services/voucher.service";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

type Variables = {
  user: {
    userId: string;
    tenantId: string;
    role: string;
  };
};

const app = new Hono<{ Variables: Variables }>();

const optionalUuid = z
  .union([z.string().uuid(), z.literal(""), z.null()])
  .optional()
  .transform((val) => (val ? val : undefined));

const voucherBatchSchema = z.object({
  productId: optionalUuid,
  campaignId: optionalUuid,
  batchNumber: z.string().min(1, "Batch reference is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(50000),
  expiryDate: z.string().optional().transform((s) => (s ? new Date(s) : undefined)),
  batchType: z.enum(["VALUE_BASED", "PRODUCT_SPECIFIC"]).optional(),
  rewardDenomination: z.union([z.string(), z.number()]).optional(),
  rewardType: z.enum(["MOBILE_MONEY", "POINTS", "AIRTIME"]).optional(),
});

/**
 * GET /api/vouchers/analytics
 */
app.get("/analytics", async (c) => {
  const user = c.get("user");
  try {
    const stats = await VoucherService.getVoucherAnalytics(user.tenantId);
    return c.json({ success: true, data: stats });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * GET /api/vouchers/batches
 */
app.get("/batches", async (c) => {
  const user = c.get("user");
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "15");

  try {
    const result = await VoucherService.listBatches(user.tenantId, page, limit);
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * GET /api/vouchers/batches/:id
 */
app.get("/batches/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  try {
    const batch = await VoucherService.getBatch(id, user.tenantId);
    if (!batch) return c.json({ success: false, error: "Batch not found" }, 404);
    return c.json({ success: true, data: batch });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * GET /api/vouchers/batches/:id/export-csv
 */
app.get("/batches/:id/export-csv", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  if (user.role !== "SYSTEM_ADMIN" && user.role !== "TENANT_ADMIN") {
    return c.json({ success: false, error: "Unauthorized. CSV dataset export is restricted to administrators." }, 403);
  }

  try {
    const rows = await VoucherService.exportBatchCSV(id, user.tenantId);
    return c.json({ success: true, data: rows });
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
 * PATCH /api/vouchers/batches/:id/rebind
 */
app.patch(
  "/batches/:id/rebind",
  zValidator(
    "json",
    z.object({
      productId: optionalUuid,
      campaignId: optionalUuid,
    })
  ),
  async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    const body = c.req.valid("json");

    try {
      const batch = await VoucherService.rebindBatch(id, user.tenantId, {
        productId: body.productId,
        campaignId: body.campaignId,
      });
      return c.json({ success: true, data: batch });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 400);
    }
  }
);

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
 * GET /api/vouchers?batchId=&status=&batchType=&page=&limit=
 */
app.get("/", async (c) => {
  const user = c.get("user");
  const batchId = c.req.query("batchId");
  const status = c.req.query("status");
  const batchType = c.req.query("batchType");
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "50");

  try {
    const result = await VoucherService.listVouchers({
      tenantId: user.tenantId,
      batchId,
      status,
      batchType,
      page,
      limit,
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * GET /api/vouchers/:id
 */
app.get("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  try {
    const voucher = await VoucherService.getVoucher(id, user.tenantId);
    if (!voucher) return c.json({ success: false, error: "Voucher not found" }, 404);
    return c.json({ success: true, data: voucher });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * DELETE /api/vouchers/batches/:id
 * Deletes an unutilized voucher batch if no vouchers have been claimed.
 */
app.delete("/batches/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  try {
    const deleted = await VoucherService.deleteBatch(id, user.tenantId, user.userId);
    return c.json({ success: true, message: "Voucher batch deleted successfully", data: deleted });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
