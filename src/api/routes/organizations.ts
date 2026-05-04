import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { OrganizationService } from "../../services/organization.service";
import { withScopedDb } from "../../db";

const app = new Hono<{ Variables: { user: any } }>();

const orgSchema = z.object({
  type: z.enum(["DEALER", "CONTRACTOR", "DISTRIBUTOR"]),
  name: z.string().min(1),
  registrationNumber: z.string().max(50).optional(),
  taxId: z.string().regex(/^[A-Z0-9]{1,20}$/, "Invalid Tax ID format").optional(),
  phone: z.string().min(10).max(15).optional(),
  email: z.string().email().optional(),
  addressLine1: z.string().max(255).optional(),
  townId: z.string().uuid().optional(),
});

app.post("/", zValidator("json", orgSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await OrganizationService.createOrganization({ ...body, tenantId: user.tenantId }, tx);
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
      return await OrganizationService.getOrganizations(user.tenantId, tx);
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
      return await OrganizationService.getOrganizationById(id, user.tenantId, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 404);
  }
});

const updateOrgSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["DEALER", "CONTRACTOR", "DISTRIBUTOR"]).optional(),
  registrationNumber: z.string().max(50).optional(),
  taxId: z.string().regex(/^[A-Z0-9]{1,20}$/, "Invalid Tax ID format").optional(),
  phone: z.string().min(10).max(15).optional(),
  email: z.string().email().optional(),
  addressLine1: z.string().max(255).optional(),
  townId: z.string().uuid().optional(),
});

app.put("/:id", zValidator("json", updateOrgSchema), async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = c.req.valid("json");

  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await OrganizationService.updateOrganization(id, user.tenantId, body, tx);
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

app.post("/:id/members", zValidator("json", memberSchema), async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = c.req.valid("json");

  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      await OrganizationService.getOrganizationById(id, user.tenantId, tx);
      return await OrganizationService.addMember(id, body.consumerId, body.role, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.get("/:id/members", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await OrganizationService.getMembers(id, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.delete("/:id/members/:memberId", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const memberId = c.req.param("memberId");

  try {
    const result = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await OrganizationService.removeMember(id, memberId, tx);
    });
    return c.json({ success: true, data: result });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;

