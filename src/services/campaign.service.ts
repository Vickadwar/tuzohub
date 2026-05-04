import { db } from "../db";
import { campaigns, campaignProducts, products } from "../db/schema";
import { eq, and, desc, count, ilike, or } from "drizzle-orm";

export class CampaignService {
  /**
   * Links a product to a campaign.
   */
  static async linkProduct(campaignId: string, productId: string) {
    const [link] = await db
      .insert(campaignProducts)
      .values({ campaignId, productId })
      .onConflictDoNothing()
      .returning();
    return link;
  }

  /**
   * Unlinks a product from a campaign.
   */
  static async unlinkProduct(campaignId: string, productId: string) {
    await db
      .delete(campaignProducts)
      .where(and(eq(campaignProducts.campaignId, campaignId), eq(campaignProducts.productId, productId)));
  }

  /**
   * Lists products linked to a campaign.
   */
  static async listLinkedProducts(campaignId: string) {
    return await db.select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      category: products.category,
    })
    .from(campaignProducts)
    .innerJoin(products, eq(campaignProducts.productId, products.id))
    .where(eq(campaignProducts.campaignId, campaignId));
  }

  /**
   * Creates a new campaign for a tenant.
   */
  static async createCampaign(params: {
    tenantId: string;
    name: string;
    description?: string;
    campaignType: string;
    pointsMultiplier?: string;
    startDate: Date;
    endDate?: Date;
    isActive?: boolean;
    isRecurring?: boolean;
  }) {
    const [campaign] = await db
      .insert(campaigns)
      .values({
        ...params,
        isActive: params.isActive ?? true,
      })
      .returning();

    return campaign;
  }

  /**
   * Lists campaigns with pagination and search.
   */
  static async listCampaigns(params: {
    tenantId: string;
    page: number;
    limit: number;
    search?: string;
  }) {
    const { tenantId, page, limit, search } = params;
    const offset = (page - 1) * limit;

    const conditions = [eq(campaigns.tenantId, tenantId)];
    
    if (search) {
      conditions.push(
        or(
          ilike(campaigns.name, `%${search}%`),
          ilike(campaigns.description, `%${search}%`)
        ) as any
      );
    }

    const where = and(...conditions);

    const [rows, totalResult] = await Promise.all([
      db.query.campaigns.findMany({
        where,
        orderBy: [desc(campaigns.createdAt)],
        limit,
        offset,
      }),
      db.select({ total: count() }).from(campaigns).where(where),
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
   * Updates an existing campaign.
   */
  static async updateCampaign(id: string, tenantId: string, updates: Partial<typeof campaigns.$inferInsert>) {
    const [campaign] = await db
      .update(campaigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(campaigns.id, id), eq(campaigns.tenantId, tenantId)))
      .returning();

    if (!campaign) throw new Error("Campaign not found or unauthorized");
    return campaign;
  }

  /**
   * Gets a single campaign by ID.
   */
  static async getCampaign(id: string, tenantId: string) {
    const campaign = await db.query.campaigns.findFirst({
      where: and(eq(campaigns.id, id), eq(campaigns.tenantId, tenantId)),
    });

    if (!campaign) throw new Error("Campaign not found or unauthorized");
    return campaign;
  }
}
