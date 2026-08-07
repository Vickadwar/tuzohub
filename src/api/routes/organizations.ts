import { Hono } from "hono";
import { z } from "zod";
import { OrganizationService } from "../../services/organization.service";
import { withScopedDb, db } from "../../db";
import { tenants } from "../../db/schema";
import { eq } from "drizzle-orm";

const app = new Hono<{ Variables: { user: any } }>();

async function getAuthContext(c: any) {
  const user = c.get("user") || {};
  let tenantId = user.tenantId;
  const userId = user.userId || user.id || "00000000-0000-0000-0000-000000000000";
  const role = user.role || "authenticated";

  if (!tenantId) {
    const activeTenants = await db.select().from(tenants).where(eq(tenants.isActive, true)).limit(1);
    if (activeTenants.length > 0) {
      tenantId = activeTenants[0].id;
    }
  }

  if (!tenantId) {
    throw new Error("No active tenant found in system.");
  }

  return { userId, tenantId, role };
}

const orgSchema = z.object({
  type: z.enum(["DEALER", "CONTRACTOR", "DISTRIBUTOR"]),
  name: z.string().min(1, "Organization name is required"),
  registrationNumber: z.string().optional().nullable().transform(v => (v && v.trim() ? v.trim() : undefined)),
  taxId: z.string().optional().nullable().transform(v => (v && v.trim() ? v.trim() : undefined)),
  phone: z.string().optional().nullable().transform(v => (v && v.trim() ? v.trim() : undefined)),
  email: z.string().optional().nullable().transform(v => (v && v.trim() ? v.trim() : undefined)),
  addressLine1: z.string().optional().nullable().transform(v => (v && v.trim() ? v.trim() : undefined)),
  townId: z.string().optional().nullable().transform(v => (v && v.trim() ? v.trim() : undefined)),
  salesPersonId: z.string().optional().nullable().transform(v => (v && v.trim() ? v.trim() : undefined)),
});

app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = orgSchema.safeParse(body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return c.json({ success: false, error: errorMsg }, 400);
    }
    const { userId, tenantId, role } = await getAuthContext(c);
    const result = await withScopedDb(userId, role, async (tx) => {
      return await OrganizationService.createOrganization({ ...parsed.data, tenantId }, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    console.error("[POST /api/organizations Error]", error);
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.get("/", async (c) => {
  try {
    const { userId, tenantId, role } = await getAuthContext(c);
    const result = await withScopedDb(userId, role, async (tx) => {
      return await OrganizationService.getOrganizations(tenantId, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.get("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const { userId, tenantId, role } = await getAuthContext(c);
    const result = await withScopedDb(userId, role, async (tx) => {
      return await OrganizationService.getOrganizationById(id, tenantId, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 404);
  }
});

app.put("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const parsed = orgSchema.partial().safeParse(body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return c.json({ success: false, error: errorMsg }, 400);
    }
    const { userId, tenantId, role } = await getAuthContext(c);
    const result = await withScopedDb(userId, role, async (tx) => {
      return await OrganizationService.updateOrganization(id, tenantId, parsed.data, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const { userId, tenantId, role } = await getAuthContext(c);
    const result = await withScopedDb(userId, role, async (tx) => {
      return await OrganizationService.deleteOrganization(id, tenantId, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Organization Members
const memberSchema = z.object({
  consumerId: z.string().uuid(),
  role: z.string().min(1),
});

app.post("/:id/members", async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const parsed = memberSchema.safeParse(body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return c.json({ success: false, error: errorMsg }, 400);
    }
    const { userId, tenantId, role } = await getAuthContext(c);
    const result = await withScopedDb(userId, role, async (tx) => {
      await OrganizationService.getOrganizationById(id, tenantId, tx);
      return await OrganizationService.addMember(id, parsed.data.consumerId, parsed.data.role, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.get("/:id/members", async (c) => {
  const id = c.req.param("id");
  try {
    const { userId, role } = await getAuthContext(c);
    const result = await withScopedDb(userId, role, async (tx) => {
      return await OrganizationService.getMembers(id, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.delete("/:id/members/:memberId", async (c) => {
  const id = c.req.param("id");
  const memberId = c.req.param("memberId");

  try {
    const { userId, role } = await getAuthContext(c);
    const result = await withScopedDb(userId, role, async (tx) => {
      return await OrganizationService.removeMember(id, memberId, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
