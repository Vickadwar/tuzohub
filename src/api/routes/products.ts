import { Context, Hono } from "hono";
import { ProductService } from "../../services/product.service";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "../../db";
import { tenants, users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { supabase } from "../../lib/supabase";

const app = new Hono<{ Variables: { user: any } }>();

async function resolveTenantId(c: Context) {
  const user = c.get("user");
  
  // Allow SYSTEM_ADMIN to explicitly scope to a tenant via query param
  if (user?.role === "SYSTEM_ADMIN" && c.req.query("tenantId")) {
    return c.req.query("tenantId");
  }

  if (user?.tenantId) {
    return user.tenantId;
  }

  const authHeader = c.req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const { data: { user: authUser } } = await supabase.auth.getUser(token);
      if (authUser) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, authUser.id)
        });
        if (dbUser?.tenantId) return dbUser.tenantId;
      }
    } catch (e) {
      console.warn("[Products resolveTenantId] Auth token error:", e);
    }
  }

  return null;
}

const productSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Product name is required"),
  category: z.string().nullable().optional(),
  subcategory: z.string().nullable().optional(),
  unitOfMeasure: z.string().nullable().optional(),
  measurementValue: z.union([z.number(), z.string()]).transform(val => val !== null && val !== undefined ? String(val) : null).nullable().optional(),
  barcode: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  pointsPerUnit: z.number().int().min(0).optional(),
  price: z.string().nullable().optional(),
  costPrice: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/products
 * Returns paginated list of products for the tenant.
 */
app.get("/", async (c) => {
  const tenantId = await resolveTenantId(c);
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "200");
  const search = c.req.query("search");
  const category = c.req.query("category");

  if (!tenantId) {
    return c.json({ success: false, error: "Tenant reference not found" }, 403);
  }

  try {
    const result = await ProductService.listProducts({
      tenantId,
      page,
      limit,
      search,
      category,
    });
    return c.json({ success: true, data: result.items, pagination: result.pagination });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * GET /api/products/meta/categories-uom
 * Returns dynamic categories and units of measure for the tenant.
 */
app.get("/meta/categories-uom", async (c) => {
  const tenantId = await resolveTenantId(c);
  if (!tenantId) {
    return c.json({ success: false, error: "Tenant reference not found" }, 403);
  }

  try {
    const data = await ProductService.getCategoriesAndUoms(tenantId);
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * GET /api/products/settings
 * Returns inventory & catalog settings breakdown.
 */
app.get("/settings", async (c) => {
  const tenantId = await resolveTenantId(c);
  if (!tenantId) {
    return c.json({ success: false, error: "Tenant reference not found" }, 403);
  }

  try {
    const data = await ProductService.getInventorySettings(tenantId);
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * POST /api/products/settings/categories
 */
app.post("/settings/categories", async (c) => {
  const user = c.get("user");
  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant not found" }, 403);
  }

  try {
    const body = await c.req.json();
    const category = await ProductService.addCategory(user.tenantId, body.name, body.description);
    return c.json({ success: true, data: category });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * DELETE /api/products/settings/categories/:id
 */
app.delete("/settings/categories/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant not found" }, 403);
  }

  try {
    await ProductService.deleteCategory(user.tenantId, id);
    return c.json({ success: true, message: "Category deleted" });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * POST /api/products/settings/uoms
 */
app.post("/settings/uoms", async (c) => {
  const user = c.get("user");
  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant not found" }, 403);
  }

  try {
    const body = await c.req.json();
    const uom = await ProductService.addUom(user.tenantId, body.name, body.symbol);
    return c.json({ success: true, data: uom });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * DELETE /api/products/settings/uoms/:id
 */
app.delete("/settings/uoms/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant not found" }, 403);
  }

  try {
    await ProductService.deleteUom(user.tenantId, id);
    return c.json({ success: true, message: "Unit of measure deleted" });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * POST /api/products
 * Creates a new product.
 */
app.post("/", zValidator("json", productSchema), async (c) => {
  const tenantId = await resolveTenantId(c);
  const body = c.req.valid("json");

  if (!tenantId) {
    return c.json({ success: false, error: "Tenant reference not found" }, 403);
  }

  try {
    const product = await ProductService.createProduct({
      ...body,
      tenantId,
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
  const tenantId = await resolveTenantId(c);
  const id = c.req.param("id");

  if (!tenantId) {
    return c.json({ success: false, error: "Tenant reference not found" }, 403);
  }

  try {
    const product = await ProductService.getProduct(id, tenantId);
    return c.json({ success: true, data: product });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 404);
  }
});

/**
 * PATCH /api/products/:id
 */
app.patch("/:id", zValidator("json", productSchema.partial()), async (c) => {
  const tenantId = await resolveTenantId(c);
  const id = c.req.param("id");
  const body = c.req.valid("json");

  if (!tenantId) {
    return c.json({ success: false, error: "Tenant reference not found" }, 403);
  }

  try {
    const product = await ProductService.updateProduct(id, tenantId, body as any);
    return c.json({ success: true, data: product });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * DELETE /api/products/:id
 */
app.delete("/:id", async (c) => {
  const tenantId = await resolveTenantId(c);
  const id = c.req.param("id");

  if (!tenantId) {
    return c.json({ success: false, error: "Tenant reference not found" }, 403);
  }

  try {
    const deleted = await ProductService.deleteProduct(id, tenantId);
    return c.json({ success: true, message: "Product deleted successfully", data: deleted });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
