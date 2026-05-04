import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { LoyaltyService } from "../../services/loyalty.service";
import { withScopedDb } from "../../db";
import { vouchers, voucherBatches, redemptionsQueue } from "../../db/schema";
import { eq, sql } from "drizzle-orm";

const app = new Hono<{ Variables: { user: any } }>();

// ─── Validation Schemas ───────────────────────────────────────────────────────

const earnSchema = z.object({
  consumerId: z.string().uuid(),
  points: z.string().regex(/^\d+(\.\d+)?$/, "Points must be a positive numeric string"),
  category: z.string().min(1),
  description: z.string().optional(),
  campaignId: z.string().uuid().optional(),
});

const redeemSchema = z.object({
  consumerId: z.string().uuid(),
  points: z.string().regex(/^\d+(\.\d+)?$/, "Points must be a positive numeric string"),
  rewardItemId: z.string().uuid(),
  destinationAccount: z.string().min(1, "Destination account is required"),
  amountValue: z.string().regex(/^\d+(\.\d+)?$/, "Amount must be a positive numeric string"),
  currencyCode: z.string().length(3, "Currency code must be 3 characters (e.g. KES)"),
  fulfillmentMode: z.enum(["AUTOMATED_PAYOUT", "INTERNAL_VOUCHER", "MANUAL_FULFILLMENT"]),
  description: z.string().optional(),
});

const purchaseSchema = z.object({
  consumerId: z.string().uuid(),
  totalAmount: z.number().positive(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      categoryId: z.string().optional(),
      amount: z.number().positive(),
      quantity: z.number().int().positive(),
    })
  ),
});

const historyQuerySchema = z.object({
  consumerId: z.string().uuid(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(["CREDIT", "DEBIT"]).optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});

// ─── READ ROUTES ──────────────────────────────────────────────────────────────

/**
 * GET /api/loyalty/balance?consumerId=<uuid>
 * Returns the current wallet snapshot for a consumer.
 */
app.get("/balance", async (c) => {
  const user = c.get("user");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant not found" }, 403);
  }

  const consumerId = c.req.query("consumerId");
  if (!consumerId) {
    return c.json({ success: false, error: "consumerId query param is required" }, 400);
  }

  try {
    const wallet = await LoyaltyService.getBalance(user.tenantId, consumerId);
    return c.json({ success: true, data: wallet });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * GET /api/loyalty/history?consumerId=<uuid>&page=1&limit=20&type=CREDIT&from=...&to=...
 * Returns paginated transaction history for a consumer.
 */
app.get("/history", zValidator("query", historyQuerySchema), async (c) => {
  const user = c.get("user");
  const query = c.req.valid("query");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant not found" }, 403);
  }

  try {
    const result = await LoyaltyService.getTransactionHistory({
      tenantId: user.tenantId,
      consumerId: query.consumerId,
      page: query.page,
      limit: query.limit,
      type: query.type,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    });

    return c.json({ success: true, ...result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * GET /api/loyalty/stats/overview
 * Returns aggregated dashboard metrics for the tenant.
 */
app.get("/stats/overview", async (c) => {
  const user = c.get("user");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant not found" }, 403);
  }

  try {
    const stats = await LoyaltyService.getOverviewStats(user.tenantId);
    return c.json({ success: true, data: stats });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ─── WRITE ROUTES ─────────────────────────────────────────────────────────────

/**
 * POST /api/loyalty/earn
 * Manually credits points to a consumer wallet.
 */
app.post("/earn", zValidator("json", earnSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant not found" }, 403);
  }

  try {
    const transaction = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await LoyaltyService.processEarning(
        {
          tenantId: user.tenantId,
          consumerId: body.consumerId,
          points: body.points,
          actionCategory: body.category,
          description: body.description,
          campaignId: body.campaignId,
        },
        tx
      );
    });

    return c.json({
      success: true,
      data: transaction,
      message: `Successfully credited ${body.points} points`,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * POST /api/loyalty/purchase
 * Processes a purchase event and automatically awards points via Campaign Engine.
 */
app.post("/purchase", zValidator("json", purchaseSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant not found" }, 403);
  }

  try {
    const transaction = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await LoyaltyService.processPurchase(
        {
          tenantId: user.tenantId,
          consumerId: body.consumerId,
          totalAmount: body.totalAmount,
          items: body.items,
        },
        tx
      );
    });

    return c.json({
      success: true,
      data: transaction,
      message: `Purchase processed successfully. Points earned: ${transaction.pointsAmount}`,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * POST /api/loyalty/redeem
 * Redeems points from a consumer wallet and enqueues a payout.
 */
app.post("/redeem", zValidator("json", redeemSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant not found" }, 403);
  }

  try {
    const transaction = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await LoyaltyService.processRedemption(
        {
          tenantId: user.tenantId,
          consumerId: body.consumerId,
          pointsToRedeem: body.points,
          rewardItemId: body.rewardItemId,
          destinationAccount: body.destinationAccount,
          amountValue: body.amountValue,
          currencyCode: body.currencyCode,
          fulfillmentMode: body.fulfillmentMode,
          description: body.description,
        },
        tx
      );
    });

    return c.json({
      success: true,
      data: transaction,
      message: `Successfully redeemed ${body.points} points`,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// ─── ADMIN / INTERNAL ROUTES ──────────────────────────────────────────────────

/**
 * POST /api/loyalty/process-redemptions?limit=10
 * Internal endpoint — drains pending items from the redemption payout queue.
 * Intended for cron jobs or manual admin triggers. Requires PLATFORM_ADMIN role.
 */
app.post("/process-redemptions", async (c) => {
  const user = c.get("user");

  if (user.role !== "PLATFORM_ADMIN" && user.role !== "service_role") {
    return c.json({ success: false, error: "Forbidden" }, 403);
  }

  const limitParam = c.req.query("limit");
  const limit = limitParam ? Math.min(parseInt(limitParam, 10), 50) : 10;

  try {
    const { RedemptionHandler } = await import("../../services/redemption.handler");
    const handler = new RedemptionHandler();
    await handler.processPending(limit);

    return c.json({
      success: true,
      message: `Redemption processing triggered for up to ${limit} items`,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /api/loyalty/terminal/bank
const bankSchema = z.object({
  consumerId: z.string().uuid(),
  points: z.string(),
  type: z.enum(["BANK", "UNBANK"]),
  description: z.string().optional(),
});

app.post("/terminal/bank", zValidator("json", bankSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  if (user.role !== "TENANT_ADMIN" && user.role !== "SYSTEM_ADMIN" && user.role !== "service_role") {
    return c.json({ success: false, error: "Forbidden" }, 403);
  }

  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await LoyaltyService.processBanking({
        tenantId: user.tenantId,
        ...body
      }, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// POST /api/loyalty/terminal/voucher-redeem
const redeemVoucherSchema = z.object({
  consumerId: z.string().uuid(),
  voucherCode: z.string().optional(),
  serialNumber: z.string().optional(),
});

app.post("/terminal/voucher-redeem", zValidator("json", redeemVoucherSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  if (user.role !== "TENANT_ADMIN" && user.role !== "SYSTEM_ADMIN" && user.role !== "service_role") {
    return c.json({ success: false, error: "Forbidden" }, 403);
  }

  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      // 1. Redeem voucher and credit wallet
      const earnTx = await LoyaltyService.redeemVoucher({
        tenantId: user.tenantId,
        consumerId: body.consumerId,
        voucherCode: body.voucherCode,
        serialNumber: body.serialNumber,
      }, tx);

      // 2. Auto Mobile Money Payout Simulation
      // Terminal simulation means we just consume those points to Mobile Money instantly.
      const redemption = await LoyaltyService.processRedemption({
        tenantId: user.tenantId,
        consumerId: body.consumerId,
        pointsToRedeem: earnTx.pointsAmount,
        destinationAccount: "SIMULATION",
        amountValue: earnTx.pointsAmount, // 1 point = 1 KES simulation
        currencyCode: "KES",
        fulfillmentMode: "AUTOMATED_PAYOUT",
        description: `Auto-Payout for Voucher ${earnTx.serialNumber}`,
        metadata: {
          productName: earnTx.productName,
          voucherSerialNumber: earnTx.serialNumber,
          isAutoPayout: true,
        }
      }, tx);

      // 3. Mark it as SUCCESS with a realistic mock M-Pesa confirmation code
      const MOCK_MPESA_CODES = ["SHJ61GRQEN", "RLK54DPXMT", "QWA82HYCFN"];
      const mpesaRef = MOCK_MPESA_CODES[Math.floor(Math.random() * MOCK_MPESA_CODES.length)];
      await tx.update(redemptionsQueue)
        .set({ status: "SUCCESS", externalReference: mpesaRef })
        .where(eq(redemptionsQueue.id, redemption.queueItem.id));

      // Quick hack: Update the transaction metadata to explicitly contain mpesaRef so the frontend can read it instantly
      try {
        const { transactions } = await import("../../db/schema");
        await tx.update(transactions)
          .set({
            metadata: sql`jsonb_set(COALESCE(metadata, '{}'::jsonb), '{mpesaRef}', ${`"${mpesaRef}"`}::jsonb, true)`
          })
          .where(eq(transactions.id, redemption.transaction.id));
      } catch (e) {
        // ignore if fails, simulated daraja will still show
      }

      return { earnTx, redemption, mpesaRef };
    });

    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// POST /api/loyalty/terminal/adjust
const adjustSchema = z.object({
  consumerId: z.string().uuid(),
  points: z.string(),
  type: z.enum(["CREDIT", "DEBIT"]),
  description: z.string().optional(),
});

app.post("/terminal/adjust", zValidator("json", adjustSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  if (user.role !== "TENANT_ADMIN" && user.role !== "SYSTEM_ADMIN" && user.role !== "service_role") {
    return c.json({ success: false, error: "Forbidden" }, 403);
  }

  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await LoyaltyService.manualAdjustment({
        tenantId: user.tenantId,
        ...body
      }, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * POST /api/loyalty/redemptions/:id/approve
 * Approves a pending redemption and triggers Daraja payout.
 */
app.post("/redemptions/:id/approve", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  if (user.role !== "TENANT_ADMIN" && user.role !== "SYSTEM_ADMIN") {
    return c.json({ success: false, error: "Forbidden" }, 403);
  }

  try {
    const result = await LoyaltyService.approveRedemption(id, user.tenantId, user.userId);
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
