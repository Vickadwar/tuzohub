import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { UserService } from "../../services/user.service";
import { withScopedDb } from "../../db";

const app = new Hono<{ Variables: { user: any } }>();

const inviteSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["SYSTEM_ADMIN", "TENANT_ADMIN", "MANAGER", "OPERATOR", "VIEWER"]),
});

// GET /api/users
app.get("/", async (c) => {
  const user = c.get("user");
  if (!user.tenantId) return c.json({ success: false, error: "Tenant required" }, 403);
  
  try {
    const users = await UserService.getUsers(user.tenantId);
    return c.json({ success: true, data: users });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// GET /api/users/me
app.get("/me", async (c) => {
  const user = c.get("user");
  return c.json({ success: true, data: user });
});

// PUT /api/users/me
const updateProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

app.put("/me", zValidator("json", updateProfileSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  try {
    const updatedUser = await UserService.updateProfile(user.userId, body);
    return c.json({ success: true, data: updatedUser, message: "Profile updated" });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// POST /api/users/invite
app.post("/invite", zValidator("json", inviteSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant context missing" }, 403);
  }

  // Basic RBAC checking
  if (user.role !== "TENANT_ADMIN" && user.role !== "SYSTEM_ADMIN" && user.role !== "service_role") {
    return c.json({ success: false, error: "Forbidden" }, 403);
  }

  try {
    const newUser = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await UserService.inviteUser({
        tenantId: user.tenantId,
        ...body
      }, tx);
    });
    return c.json({ success: true, data: newUser, message: "User invited successfully" });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// PATCH /api/users/:id/role
const updateRoleSchema = z.object({
  role: z.enum(["SYSTEM_ADMIN", "TENANT_ADMIN", "CASHIER", "SUPPORT", "SALES_REP"]),
});

app.patch("/:id/role", zValidator("json", updateRoleSchema), async (c) => {
  const user = c.get("user");
  const targetUserId = c.req.param("id");
  const { role } = c.req.valid("json");

  if (user.role !== "TENANT_ADMIN" && user.role !== "SYSTEM_ADMIN" && user.role !== "service_role") {
    return c.json({ success: false, error: "Forbidden" }, 403);
  }

  try {
    const updatedUser = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await UserService.updateUserRole(targetUserId, role, tx);
    });
    return c.json({ success: true, data: updatedUser, message: "User role updated successfully" });
  } catch(error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// DELETE /api/users/:id
app.delete("/:id", async (c) => {
  const user = c.get("user");
  const targetId = c.req.param("id");

  if (user.role !== "TENANT_ADMIN" && user.role !== "SYSTEM_ADMIN") {
    return c.json({ success: false, error: "Forbidden" }, 403);
  }

  try {
    await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await UserService.deactivateUser(targetId, tx);
    });
    return c.json({ success: true, message: "User deactivated" });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
