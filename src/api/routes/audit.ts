import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { AuditService } from "../../services/audit.service";

type Variables = {
  user: {
    userId: string;
    tenantId: string;
    role: string;
  };
};

const app = new Hono<{ Variables: Variables }>();

app.use("*", authMiddleware);

/**
 * GET /api/audit-logs
 * Fetches tenant audit trail with filters.
 */
app.get("/", async (c) => {
  const user = c.get("user");
  const action = c.req.query("action");
  const entityType = c.req.query("entityType");
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");

  try {
    const result = await AuditService.listLogs({
      tenantId: user.tenantId,
      action,
      entityType,
      page,
      limit,
    });
    return c.json({ success: true, ...result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default app;
