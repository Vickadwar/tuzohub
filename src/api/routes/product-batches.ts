import { Hono } from "hono";
import { ProductBatchService } from "../../services/product-batch.service";
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

const productBatchSchema = z.object({
  productId: z.string().uuid("Product ID is required"),
  batchNumber: z.string().min(1, "Batch Number is required"),
  quantityProduced: z.number().int().min(1),
  productionDate: z.string().transform(s => new Date(s)),
  expiryDate: z.string().optional().transform(s => s ? new Date(s) : undefined),
  status: z.string().optional(),
  voucherBatchIds: z.array(z.string()).optional(),
  campaignId: z.string().optional(),
});

/**
 * GET /api/product-batches
 */
app.get("/", async (c) => {
  const user = c.get("user");
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "10");

  try {
    const result = await ProductBatchService.listBatches(user.tenantId, page, limit);
    return c.json({ success: true, ...result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * POST /api/product-batches
 */
app.post("/", zValidator("json", productBatchSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  try {
    const batch = await ProductBatchService.createBatch({
      ...body,
      tenantId: user.tenantId,
    });
    return c.json({ success: true, data: batch });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * GET /api/product-batches/:id
 */
app.get("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  try {
    const batch = await ProductBatchService.getBatch(id, user.tenantId);
    return c.json({ success: true, data: batch });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 404);
  }
});

/**
 * PATCH /api/product-batches/:id
 */
app.patch("/:id", zValidator("json", z.object({ status: z.string() })), async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const { status } = c.req.valid("json");

  try {
    const batch = await ProductBatchService.updateStatus(id, user.tenantId, status);
    return c.json({ success: true, data: batch });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
