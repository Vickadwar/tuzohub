import { db } from "../db";
import { rewardCategories, rewardItems } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export class RewardService {
  static async createCategory(
    tenantId: string,
    data: { name: string; displayOrder?: number },
    tx: any = db
  ) {
    const [category] = await tx.insert(rewardCategories).values({
      id: uuidv4(),
      tenantId,
      name: data.name,
      displayOrder: data.displayOrder || 0,
      isActive: true,
    }).returning();

    return category;
  }

  static async createRewardItem(
    tenantId: string,
    categoryId: string | null,
    data: {
      name: string;
      rewardType: any;
      fulfillmentStrategy: any;
      requiredPoints: string;
    },
    tx: any = db
  ) {
    const [item] = await tx.insert(rewardItems).values({
      id: uuidv4(),
      tenantId,
      categoryId,
      name: data.name,
      rewardType: data.rewardType,
      fulfillmentStrategy: data.fulfillmentStrategy,
      requiredPoints: data.requiredPoints,
      isActive: true,
    }).returning();

    return item;
  }

  static async getRewardsCatalog(tenantId: string, tx: any = db) {
    const categories = await tx.select().from(rewardCategories).where(
      and(eq(rewardCategories.tenantId, tenantId), eq(rewardCategories.isActive, true))
    );
    
    const items = await tx.select().from(rewardItems).where(
      and(eq(rewardItems.tenantId, tenantId), eq(rewardItems.isActive, true))
    );

    // Group items by category. Uncategorized items sit at the root level.
    const catalog = categories.map((cat: any) => ({
      ...cat,
      items: items.filter((i: any) => i.categoryId === cat.id)
    }));

    const uncategorizedItems = items.filter((i: any) => !i.categoryId);

    return {
      categories: catalog,
      uncategorized: uncategorizedItems
    };
  }
}
