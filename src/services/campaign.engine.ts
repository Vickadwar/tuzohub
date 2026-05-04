import { db } from "../db";
import { campaigns, campaignRules, campaignProducts, transactions, wallets } from "../db/schema";
import { eq, and, sql, or, lte, gte, count } from "drizzle-orm";

export interface PurchaseContext {
  tenantId: string;
  consumerId: string;
  totalAmount: number;
  items: Array<{
    productId: string;
    categoryId?: string;
    amount: number;
    quantity: number;
  }>;
  now?: Date;
}

export class CampaignEngine {
  /**
   * Evaluates all active campaigns for a purchase and returns the best matching one.
   * Priority logic: Higher priority value wins.
   */
  static async findApplicableCampaign(context: PurchaseContext, database = db) {
    const now = context.now || new Date();

    // 1. Fetch active campaigns for the tenant that are within the date range
    const activeCampaigns = await database.query.campaigns.findMany({
      where: and(
        eq(campaigns.tenantId, context.tenantId),
        eq(campaigns.isActive, true),
        lte(campaigns.startDate, now),
        or(sql`${campaigns.endDate} IS NULL`, gte(campaigns.endDate, now))
      ),
      orderBy: (c: any, { desc }: any) => [desc(c.priority)],
      with: {
        rules: true,
        products: true,
      },
    });

    for (const campaign of activeCampaigns) {
      const isMatch = await this.evaluateCampaign(campaign, context);
      if (isMatch) {
        return campaign;
      }
    }

    return null;
  }

  private static async evaluateCampaign(campaign: any, context: PurchaseContext): Promise<boolean> {
    // 1. If the campaign is product-specific, ensure at least one product matches
    if (campaign.products.length > 0) {
      const productIds = context.items.map(i => i.productId);
      const hasMatchingProduct = campaign.products.some((cp: any) => productIds.includes(cp.productId));
      if (!hasMatchingProduct) return false;
    }

    // 2. Evaluate all rules (run async-aware evaluation)
    for (const rule of campaign.rules) {
      const ruleMatch = await this.evaluateRule(rule, context);
      if (!ruleMatch) return false; // All rules must match (AND logic)
    }

    return true;
  }

  private static async evaluateRule(rule: any, context: PurchaseContext): Promise<boolean> {
    const config = rule.configuration as any;
    const now = context.now || new Date();

    switch (rule.ruleType) {
      case "CART_TOTAL":
        if (config.minAmount && context.totalAmount < config.minAmount) return false;
        if (config.maxAmount && context.totalAmount > config.maxAmount) return false;
        break;

      case "SCHEDULE":
        // e.g., { "days": [1, 2, 3], "hourStart": 9, "hourEnd": 17 }
        if (config.days && !config.days.includes(now.getDay())) return false;
        const hour = now.getHours();
        if (config.hourStart && hour < config.hourStart) return false;
        if (config.hourEnd && hour >= config.hourEnd) return false;
        break;

      case "FIRST_PURCHASE": {
        // Check if this consumer has any prior PURCHASE transactions on this tenant.
        // We join via wallets to scope by tenant + consumer.
        const [result] = await db
          .select({ total: count() })
          .from(transactions)
          .innerJoin(wallets, eq(transactions.walletId, wallets.id))
          .where(
            and(
              eq(wallets.tenantId, context.tenantId),
              eq(wallets.ownerId, context.consumerId),
              eq(wallets.ownerType, "CONSUMER"),
              eq(transactions.actionCategory, "PURCHASE")
            )
          );
        // If consumer already has purchase history, rule does not match
        if ((result?.total ?? 0) > 0) return false;
        break;
      }

      default:
        // Unknown or unimplemented rules pass by default for now
        break;
    }

    return true;
  }

  /**
   * Calculates points based on a matched campaign
   */
  static calculatePoints(basePoints: number, campaign: any): number {
    if (!campaign) return basePoints;

    let finalPoints = basePoints;

    // Apply fixed override if present
    if (campaign.pointConversionOverride) {
      // Conversion override might mean "$1 = X points" instead of default
      const override = parseFloat(campaign.pointConversionOverride);
      finalPoints = basePoints * override; 
    }

    // Apply multiplier
    const multiplier = parseFloat(campaign.pointsMultiplier || "1.0");
    finalPoints = finalPoints * multiplier;

    return Math.floor(finalPoints);
  }
}
