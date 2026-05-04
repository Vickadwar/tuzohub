import { Hono } from "hono";
import { ProductService } from "../../services/product.service";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const app = new Hono<{ Variables: { user: any } }>();

const productSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Product name is required"),
  category: z.string().nullable().optional(),
  subcategory: z.string().nullable().optional(),
  unitOfMeasure: z.string().nullable().optional(),
  pointsPerUnit: z.number().int().min(0).optional(),
  price: z.string().nullable().optional(),
  costPrice: z.string().nullable().optional(),
});

/**
 * GET /api/products
 * Returns paginated list of products for the tenant.
 */
app.get("/", async (c) => {
  const user = c.get("user");
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "10");
  const search = c.req.query("search");
  const category = c.req.query("category");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant not found" }, 403);
  }

  try {
    const result = await ProductService.listProducts({
      tenantId: user.tenantId,
      page,
      limit,
      search,
      category,
    });
    return c.json({ success: true, ...result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * POST /api/products
 * Creates a new product.
 */
app.post("/", zValidator("json", productSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant not found" }, 403);
  }

  try {
    const product = await ProductService.createProduct({
      ...body,
      tenantId: user.tenantId,
    } as any);
    return c.json({ success: true, data: product });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * GET /api/products/:id
 */
app.get("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  try {
    const product = await ProductService.getProduct(id, user.tenantId);
    return c.json({ success: true, data: product });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 404);
  }
});

/**
 * PATCH /api/products/:id
 */
app.patch("/:id", zValidator("json", productSchema.partial()), async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = c.req.valid("json");

  try {
    const product = await ProductService.updateProduct(id, user.tenantId, body as any);
    return c.json({ success: true, data: product });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
