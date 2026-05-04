import { eq, and, sql } from "drizzle-orm";
import { db } from "../index";
import { wallets, transactions, pointLots } from "../schema";

export class WalletRepository {
  /**
   * Finds a wallet for a specific owner. 
   * Useful for both Consumers and Organizations.
   */
  static async findByOwner(tenantId: string, ownerId: string, ownerType: "CONSUMER" | "ORGANIZATION", tx: any = db) {
    return await tx.query.wallets.findFirst({
      where: and(
        eq(wallets.tenantId, tenantId),
        eq(wallets.ownerId, ownerId),
        eq(wallets.ownerType, ownerType)
      ),
    });
  }

  static async create(params: {
    tenantId: string;
    ownerId: string;
    ownerType: "CONSUMER" | "ORGANIZATION";
    currencyCode: string;
  }, tx: any = db) {
    const [newWallet] = await tx.insert(wallets).values({
      tenantId: params.tenantId,
      ownerId: params.ownerId,
      ownerType: params.ownerType,
      currencyCode: params.currencyCode,
      pointsBalance: "0",
      lifetimePointsEarned: "0",
      version: 1,
    }).returning();
    return newWallet;
  }

  /**
   * Updates wallet balance with optimistic locking.
   * Returns the updated wallet if successful.
   */
  static async updateBalance(
    tx: any, 
    id: string, 
    pointsToAdd: string, 
    currentVersion: number
  ) {
    const result = await tx
      .update(wallets)
      .set({
        pointsBalance: sql`${wallets.pointsBalance} + ${pointsToAdd}`,
        lifetimePointsEarned: pointsToAdd.startsWith('-') 
          ? wallets.lifetimePointsEarned 
          : sql`${wallets.lifetimePointsEarned} + ${pointsToAdd}`,
        version: currentVersion + 1,
        updatedAt: new Date(),
      })
      .where(and(eq(wallets.id, id), eq(wallets.version, currentVersion)))
      .returning();

    if (result.length === 0) {
      throw new Error("Concurrent update error or wallet not found");
    }

    return result[0];
  }

  static async findActiveLots(tx: any, walletId: string) {
    // Note: This logic will be used by the LoyaltyService for FIFO deduction.
    // We'll query transactions linked to this wallet that have remaining point lots.
    return await tx.query.pointLots.findMany({
      where: sql`remaining_amount > 0 AND expires_at > NOW()`,
      orderBy: [sql`expires_at ASC`], // FIFO: spend oldest points first
    });
  }
}
