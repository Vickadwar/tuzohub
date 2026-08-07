import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { SalesHierarchyService } from "../../services/sales-hierarchy.service";
import { withScopedDb } from "../../db";

const app = new Hono<{ Variables: { user: any } }>();

const staffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().optional().nullable().transform(v => (v && v.trim() ? v.trim() : undefined)),
  phone: z.string().optional().nullable().transform(v => (v && v.trim() ? v.trim() : undefined)),
  role: z.enum(["SALES_PERSON", "ASM", "REGIONAL_MANAGER", "CEO"]),
  managerId: z.string().optional().nullable().transform(v => (v && v.trim() ? v.trim() : undefined)),
  regionId: z.string().optional().nullable().transform(v => (v && v.trim() ? v.trim() : undefined)),
});

app.post("/", zValidator("json", staffSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await SalesHierarchyService.createStaff({ ...body, tenantId: user.tenantId }, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.get("/", async (c) => {
  const user = c.get("user");
  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await SalesHierarchyService.getStaffList(user.tenantId, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.get("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await SalesHierarchyService.getStaffById(id, user.tenantId, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 404);
  }
});

app.put("/:id", zValidator("json", staffSchema.partial()), async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = c.req.valid("json");

  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await SalesHierarchyService.updateStaff(id, user.tenantId, body, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await SalesHierarchyService.deleteStaff(id, user.tenantId, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

const assignmentSchema = z.object({
  organizationId: z.string().uuid(),
});

app.post("/:id/assignments", zValidator("json", assignmentSchema), async (c) => {
  const user = c.get("user");
  const staffId = c.req.param("id");
  const body = c.req.valid("json");

  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await SalesHierarchyService.assignStaffToOrganization(user.tenantId, staffId, body.organizationId, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.get("/:id/assignments", async (c) => {
  const user = c.get("user");
  const staffId = c.req.param("id");

  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await SalesHierarchyService.getStaffAssignments(staffId, user.tenantId, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
