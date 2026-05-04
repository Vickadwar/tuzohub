import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { SalesHierarchyService } from "../../services/sales-hierarchy.service";
import { withScopedDb } from "../../db";

const app = new Hono<{ Variables: { user: any } }>();

const staffSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(["SALES_PERSON", "ASM", "REGIONAL_MANAGER", "CEO"]),
  managerId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
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

const updateStaffSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(["SALES_PERSON", "ASM", "REGIONAL_MANAGER", "CEO"]).optional(),
  managerId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
});

app.put("/:id", zValidator("json", updateStaffSchema), async (c) => {
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

