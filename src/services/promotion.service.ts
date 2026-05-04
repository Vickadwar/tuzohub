import { db } from "../db";
import { promotions } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";

export interface CartItem {
  productId: string;
  category: string;
  quantity: number;
  price: number;
}

export class PromotionService {
  static async createPromotion(data: typeof promotions.$inferInsert, tx: any = db) {
    const result = await tx.insert(promotions).values({ ...data, isActive: true }).returning();
    return result[0];
  }

  static async getActivePromotions(tenantId: string, tx: any = db) {
    return await tx.select().from(promotions).where(
      and(
        eq(promotions.tenantId, tenantId),
        eq(promotions.isActive, true),
        sql`coalesce(usage_limit_total, 9999999) > usage_count`,
        sql`start_date <= NOW()`,
        sql`coalesce(end_date, '2099-01-01'::timestamp with time zone) >= NOW()`
      )
    );
  }

  static async evaluateCart(tenantId: string, consumerId: string, cart: CartItem[], totalAmount: number, tx: any = db) {
    const activePromos = await this.getActivePromotions(tenantId, tx);
    
    let totalDiscount = 0;
    let applicablePromos = [];

    // Evaluate in order of Priority
    const sortedPromos = activePromos.sort((a: any, b: any) => (b.priority || 0) - (a.priority || 0));

    for (const promo of sortedPromos) {
      if (promo.minCartValue && totalAmount < Number(promo.minCartValue)) continue;

      let promoDiscount = 0;
      const config = promo.configuration as any;

      if (promo.promotionType === "FIXED_DISCOUNT") {
        promoDiscount = config.amount || 0;
      } else if (promo.promotionType === "PERCENTAGE_DISCOUNT") {
        promoDiscount = (totalAmount * (config.percentage || 0)) / 100;
      } else if (promo.promotionType === "BUY_X_GET_Y") {
        // Find applicable items
        const applicableItems = cart.filter(item => 
          ((promo.applicableProducts as any[]).includes(item.productId) || (promo.applicableProducts as any[]).includes(item.category))
        );
        const itemQty = applicableItems.reduce((acc, item) => acc + item.quantity, 0);

        if (itemQty >= config.buy) {
          const sets = Math.floor(itemQty / config.buy);
          const getQty = sets * config.get;
          // Apply discount value equivalent to the cheapest applicable item * getQty
          if (applicableItems.length > 0) {
            const minPrice = Math.min(...applicableItems.map(i => i.price));
            promoDiscount = minPrice * getQty;
          }
        }
      }

      if (promoDiscount > 0) {
        totalDiscount += promoDiscount;
        applicablePromos.push(promo.id);

        // Update Usage
        await tx.execute(
          db.update(promotions)
            .set({ usageCount: sql`usage_count + 1` })
            .where(eq(promotions.id, promo.id))
        );

        if (promo.stackingType === "NONE") {
          break; // Stop evaluating others
        }
      }
    }

    return {
      originalTotal: totalAmount,
      totalDiscount,
      finalTotal: Math.max(0, totalAmount - totalDiscount),
      applicablePromos
    };
  }
}
