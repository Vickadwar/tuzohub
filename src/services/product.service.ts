import { db } from "../db";
import { products } from "../db/schema";
import { eq, and, desc, count, ilike, or } from "drizzle-orm";

export class ProductService {
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
    
    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.sku, `%${search}%`)
        ) as any
      );
    }

    if (category) {
      conditions.push(eq(products.category, category));
    }

    const where = and(...conditions);

    const [rows, totalResult] = await Promise.all([
      db.query.products.findMany({
        where,
        orderBy: [desc(products.createdAt)],
        limit,
        offset,
      }),
      db.select({ total: count() }).from(products).where(where),
    ]);

    const total = totalResult[0]?.total ?? 0;

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    };
  }

  /**
   * Updates an existing product.
   */
  static async updateProduct(id: string, tenantId: string, updates: Partial<typeof products.$inferInsert>) {
    const [product] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .returning();

    if (!product) throw new Error("Product not found or unauthorized");
    return product;
  }

  /**
   * Gets a single product by ID.
   */
  static async getProduct(id: string, tenantId: string) {
    const product = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.tenantId, tenantId)),
    });

    if (!product) throw new Error("Product not found or unauthorized");
    return product;
  }
}
