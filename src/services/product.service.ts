import { db } from "../db";
import { products, productCategories, productUoms, productBatches } from "../db/schema";
import { eq, and, desc, count, ilike, or, sql } from "drizzle-orm";

export class ProductService {
  /**
   * Helper to ensure product_categories and product_uoms tables exist in Postgres.
   */
  private static tablesInitialized = false;
  private static async ensureTablesExist() {
    if (this.tablesInitialized) return;
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS product_categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id UUID NOT NULL REFERENCES tenants(id),
          name VARCHAR(100) NOT NULL,
          description TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT product_categories_name_tenant_unique UNIQUE (name, tenant_id)
        );

        CREATE TABLE IF NOT EXISTS product_uoms (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id UUID NOT NULL REFERENCES tenants(id),
          name VARCHAR(100) NOT NULL,
          symbol VARCHAR(20),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT product_uoms_name_tenant_unique UNIQUE (name, tenant_id)
        );

        ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);
        ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(100);
      `);
      this.tablesInitialized = true;
    } catch (err) {
      console.warn("Could not ensure product metadata tables", err);
    }
  }

  /**
   * Creates a new product for a tenant.
   */
  static async createProduct(params: {
    tenantId: string;
    sku: string;
    name: string;
    category?: string;
    subcategory?: string;
    unitOfMeasure?: string;
    pointsPerUnit?: number;
    price?: string;
    costPrice?: string;
  }) {
    await this.ensureTablesExist();

    // Auto-save category & UOM to tenant master settings if not already present
    if (params.category && params.tenantId) {
      await this.addCategory(params.tenantId, params.category, `Category for ${params.category}`).catch(() => {});
    }
    if (params.unitOfMeasure && params.tenantId) {
      const sym = params.unitOfMeasure.includes("(")
        ? params.unitOfMeasure.split("(")[1].replace(")", "")
        : params.unitOfMeasure.substring(0, 3).toUpperCase();
      await this.addUom(params.tenantId, params.unitOfMeasure, sym).catch(() => {});
    }

    const [product] = await db
      .insert(products)
      .values({
        ...params,
        isActive: true,
      })
      .returning();

    return product;
  }

  /**
   * Lists products with pagination and search.
   */
  static async listProducts(params: {
    tenantId: string;
    page: number;
    limit: number;
    search?: string;
    category?: string;
  }) {
    const { tenantId, page, limit, search, category } = params;
    const offset = (page - 1) * limit;

    const conditions = [eq(products.tenantId, tenantId)];

    if (category && category !== "ALL") {
      conditions.push(eq(products.category, category));
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(products.name, term),
          ilike(products.sku, term),
          ilike(products.category, term),
          ilike(products.unitOfMeasure, term)
        )!
      );
    }

    const whereClause = and(...conditions);

    const [totalCountResult] = await db
      .select({ count: count() })
      .from(products)
      .where(whereClause);

    const totalItems = totalCountResult?.count || 0;

    const items = await db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit) || 1,
      },
    };
  }

  /**
   * Updates an existing product.
   */
  static async updateProduct(id: string, tenantId: string, updates: Partial<typeof products.$inferInsert>) {
    await this.ensureTablesExist();

    if (updates.category) {
      await this.addCategory(tenantId, updates.category, `Category for ${updates.category}`).catch(() => {});
    }
    if (updates.unitOfMeasure) {
      const sym = updates.unitOfMeasure.includes("(")
        ? updates.unitOfMeasure.split("(")[1].replace(")", "")
        : updates.unitOfMeasure.substring(0, 3).toUpperCase();
      await this.addUom(tenantId, updates.unitOfMeasure, sym).catch(() => {});
    }

    const [product] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .returning();

    if (!product) throw new Error("Product not found or unauthorized");
    return product;
  }

  /**
   * Gets a single product by ID with transaction telemetry checks.
   */
  static async getProduct(id: string, tenantId: string) {
    const product = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.tenantId, tenantId)),
    });

    if (!product) throw new Error("Product not found or unauthorized");

    // Check if product is linked to batches or campaigns
    let linkedActivityCount = 0;
    try {
      const [batchCountResult] = await db
        .select({ count: count() })
        .from(productBatches)
        .where(and(eq(productBatches.productId, id), eq(productBatches.tenantId, tenantId)));
      linkedActivityCount = batchCountResult?.count || 0;
    } catch (err) {}

    return {
      ...product,
      linkedActivityCount,
      isLinkedToActivity: linkedActivityCount > 0,
      canEditSku: linkedActivityCount === 0,
      canDelete: linkedActivityCount === 0,
    };
  }

  /**
   * Deletes a product if it is not linked to any transactions or activity.
   */
  static async deleteProduct(id: string, tenantId: string) {
    const product = await this.getProduct(id, tenantId);

    if (product.isLinkedToActivity) {
      throw new Error(
        `Cannot delete product "${product.name}" because it is linked to ${product.linkedActivityCount} active inventory batch/transaction record(s). You can archive it instead.`
      );
    }

    const [deleted] = await db
      .delete(products)
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .returning();

    if (!deleted) throw new Error("Product not found or unauthorized");
    return deleted;
  }

  /**
   * Adds a new category for a tenant in PostgreSQL.
   */
  static async addCategory(tenantId: string, name: string, description?: string) {
    await this.ensureTablesExist();
    const cleanName = name.trim();
    if (!cleanName) throw new Error("Category name cannot be empty");

    const [cat] = await db
      .insert(productCategories)
      .values({
        tenantId,
        name: cleanName,
        description: description || `Category ${cleanName}`,
      })
      .onConflictDoNothing()
      .returning();

    return cat;
  }

  /**
   * Deletes a category for a tenant.
   */
  static async deleteCategory(tenantId: string, categoryId: string) {
    await this.ensureTablesExist();
    await db
      .delete(productCategories)
      .where(and(eq(productCategories.id, categoryId), eq(productCategories.tenantId, tenantId)));
  }

  /**
   * Adds a new UOM for a tenant in PostgreSQL.
   */
  static async addUom(tenantId: string, name: string, symbol?: string) {
    await this.ensureTablesExist();
    const cleanName = name.trim();
    if (!cleanName) throw new Error("UOM name cannot be empty");

    const [uom] = await db
      .insert(productUoms)
      .values({
        tenantId,
        name: cleanName,
        symbol: symbol || cleanName.substring(0, 3).toUpperCase(),
      })
      .onConflictDoNothing()
      .returning();

    return uom;
  }

  /**
   * Deletes a UOM for a tenant.
   */
  static async deleteUom(tenantId: string, uomId: string) {
    await this.ensureTablesExist();
    await db
      .delete(productUoms)
      .where(and(eq(productUoms.id, uomId), eq(productUoms.tenantId, tenantId)));
  }

  /**
   * Fetches unique tenant categories and units of measure directly from PostgreSQL.
   */
  static async getCategoriesAndUoms(tenantId: string) {
    await this.ensureTablesExist();

    // 1. Read registered tenant categories from DB
    const registeredCats = await db
      .select({ id: productCategories.id, name: productCategories.name })
      .from(productCategories)
      .where(eq(productCategories.tenantId, tenantId));

    // 2. Read registered tenant UOMs from DB
    const registeredUoms = await db
      .select({ id: productUoms.id, name: productUoms.name })
      .from(productUoms)
      .where(eq(productUoms.tenantId, tenantId));

    // 3. Read any existing product assigned categories/uoms
    const tenantProds = await db
      .select({ category: products.category, uom: products.unitOfMeasure })
      .from(products)
      .where(eq(products.tenantId, tenantId));

    const prodCategories = tenantProds.map((p) => p.category).filter(Boolean) as string[];
    const prodUoms = tenantProds.map((p) => p.uom).filter(Boolean) as string[];

    let categories = Array.from(new Set([...registeredCats.map((c) => c.name), ...prodCategories]));
    let unitsOfMeasure = Array.from(new Set([...registeredUoms.map((u) => u.name), ...prodUoms]));

    // If tenant has zero categories configured, seed starter categories into DB
    if (categories.length === 0) {
      const defaultCats = ["Coatings & Paints", "Hardware & Tools", "Agro-Inputs", "General Merchandise"];
      for (const name of defaultCats) {
        await this.addCategory(tenantId, name, `Default category for ${name}`).catch(() => {});
      }
      categories = defaultCats;
    }

    if (unitsOfMeasure.length === 0) {
      const defaultUoms = ["Litre (L)", "Kilogram (KG)", "Piece (PCS)", "Carton", "Bucket", "Unit"];
      for (const uomStr of defaultUoms) {
        const sym = uomStr.includes("(") ? uomStr.split("(")[1].replace(")", "") : uomStr.substring(0, 3).toUpperCase();
        await this.addUom(tenantId, uomStr, sym).catch(() => {});
      }
      unitsOfMeasure = defaultUoms;
    }

    return { categories, unitsOfMeasure };
  }

  /**
   * Fetches full inventory settings breakdown with database CRUD IDs.
   */
  static async getInventorySettings(tenantId: string) {
    await this.ensureTablesExist();

    // Trigger seed if empty
    await this.getCategoriesAndUoms(tenantId);

    const registeredCats = await db
      .select()
      .from(productCategories)
      .where(eq(productCategories.tenantId, tenantId));

    const registeredUoms = await db
      .select()
      .from(productUoms)
      .where(eq(productUoms.tenantId, tenantId));

    const tenantProds = await db
      .select({ category: products.category, uom: products.unitOfMeasure })
      .from(products)
      .where(eq(products.tenantId, tenantId));

    const categoryCounts: Record<string, number> = {};
    const uomCounts: Record<string, number> = {};

    tenantProds.forEach((p) => {
      if (p.category) categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
      if (p.uom) uomCounts[p.uom] = (uomCounts[p.uom] || 0) + 1;
    });

    const categories = registeredCats.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description || `Category classification for ${c.name}`,
      productCount: categoryCounts[c.name] || 0,
    }));

    const unitsOfMeasure = registeredUoms.map((u) => ({
      id: u.id,
      name: u.name,
      symbol: u.symbol || u.name.substring(0, 3).toUpperCase(),
      productCount: uomCounts[u.name] || 0,
    }));

    return {
      categories,
      unitsOfMeasure,
      generalSettings: {
        defaultSkuPrefix: "SKU-",
        pointsToPriceRatio: "0.01",
        enableLowStockAlerts: true,
      },
    };
  }
}
