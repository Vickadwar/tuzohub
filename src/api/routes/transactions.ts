import { Hono } from "hono";
import { LoyaltyService } from "../../services/loyalty.service";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const app = new Hono<{ Variables: { user: any } }>();

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  category: z.string().optional(),
  type: z.enum(["CREDIT", "DEBIT"]).optional(),
});

app.get("/", zValidator("query", querySchema), async (c) => {
  const user = c.get("user");
  const query = c.req.valid("query");

  if (!user.tenantId) {
    return c.json({ success: false, error: "Unauthorized" }, 403);
  }

  try {
    const result = await LoyaltyService.getAllTransactions({
      tenantId: user.tenantId,
      page: query.page,
      limit: query.limit,
      category: query.category,
      accountingEntry: query.type as any,
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.get("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  if (!user.tenantId) {
    return c.json({ success: false, error: "Unauthorized" }, 403);
  }

  try {
    const result = await LoyaltyService.getTransactionById(id, user.tenantId);
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 404);
  }
});

export default app;
