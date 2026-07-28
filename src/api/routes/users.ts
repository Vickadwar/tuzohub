import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { UserService } from "../../services/user.service";
import { withScopedDb } from "../../db";

const app = new Hono<{ Variables: { user: any } }>();

const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  role: z.enum(["SYSTEM_ADMIN", "TENANT_ADMIN", "MANAGER", "OPERATOR", "VIEWER"]),
  status: z.enum(["active", "inactive"]).optional(),
  password: z.string().min(6).optional(),
});

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z.enum(["SYSTEM_ADMIN", "TENANT_ADMIN", "MANAGER", "OPERATOR", "VIEWER"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

const changePasswordSchema = z.object({
  password: z.string().min(6),
});

// GET /api/users
app.get("/", async (c) => {
  const user = c.get("user");
  if (!user.tenantId) return c.json({ success: false, error: "Tenant required" }, 403);
  
  try {
    const usersList = await UserService.getUsers(user.tenantId);
    return c.json({ success: true, data: usersList });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// GET /api/users/me
app.get("/me", async (c) => {
  const user = c.get("user");
  return c.json({ success: true, data: user });
});

// GET /api/users/:id
app.get("/:id", async (c) => {
  const user = c.get("user");
  const targetUserId = c.req.param("id");
  if (!user.tenantId) return c.json({ success: false, error: "Tenant required" }, 403);

  try {
    const targetUser = await UserService.getUserById(targetUserId, user.tenantId);
    if (!targetUser) {
      return c.json({ success: false, error: "User not found" }, 404);
    }
    return c.json({ success: true, data: targetUser });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
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

// POST /api/users (Create new team member)
app.post("/", zValidator("json", createUserSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant context missing" }, 403);
  }

  if (user.role !== "TENANT_ADMIN" && user.role !== "SYSTEM_ADMIN" && user.role !== "service_role") {
    return c.json({ success: false, error: "Forbidden: Only admins can create team members" }, 403);
  }

  try {
    const newUser = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await UserService.createUser({
        tenantId: user.tenantId,
        ...body,
      }, tx);
    });
    return c.json({ success: true, data: newUser, message: "Team member created successfully" });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// POST /api/users/invite (legacy backward compatibility)
app.post("/invite", zValidator("json", createUserSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant context missing" }, 403);
  }

  try {
    const newUser = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await UserService.createUser({
        tenantId: user.tenantId,
        ...body,
      }, tx);
    });
    return c.json({ success: true, data: newUser, message: "User created successfully" });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// PUT /api/users/:id (Update team member)
app.put("/:id", zValidator("json", updateUserSchema), async (c) => {
  const user = c.get("user");
  const targetUserId = c.req.param("id");
  const body = c.req.valid("json");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant context missing" }, 403);
  }

  if (user.role !== "TENANT_ADMIN" && user.role !== "SYSTEM_ADMIN" && user.role !== "service_role") {
    return c.json({ success: false, error: "Forbidden" }, 403);
  }

  try {
    const updatedUser = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await UserService.updateUser(targetUserId, user.tenantId, body, tx);
    });
    return c.json({ success: true, data: updatedUser, message: "User updated successfully" });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// POST /api/users/:id/password (Password management)
app.post("/:id/password", zValidator("json", changePasswordSchema), async (c) => {
  const user = c.get("user");
  const targetUserId = c.req.param("id");
  const { password } = c.req.valid("json");

  if (!user.tenantId) {
    return c.json({ success: false, error: "User tenant context missing" }, 403);
  }

  if (user.role !== "TENANT_ADMIN" && user.role !== "SYSTEM_ADMIN" && user.role !== "service_role" && user.userId !== targetUserId) {
    return c.json({ success: false, error: "Forbidden" }, 403);
  }

  try {
    const updatedUser = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await UserService.updateUserPassword(targetUserId, user.tenantId, password, tx);
    });
    return c.json({ success: true, data: updatedUser, message: "Password updated successfully" });
  } catch (error: any) {
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
