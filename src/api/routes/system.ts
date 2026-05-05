import { Hono } from "hono";
import { SystemService } from "../../services/system.service";
import { withScopedDb } from "../../db";

const app = new Hono<{ Variables: { user: any } }>();

// All routes here require SYSTEM_ADMIN
app.use("*", async (c, next) => {
  const user = c.get("user");
  if (user.role !== "SYSTEM_ADMIN" && user.role !== "service_role") {
    return c.json({ success: false, error: "Forbidden: Super Admin access required" }, 403);
  }
  await next();
});

app.get("/registrations", async (c) => {
  try {
    const data = await SystemService.getRegistrations();
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.get("/stats", async (c) => {
  try {
    const data = await SystemService.getPlatformStats();
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.post("/registrations/:id/approve", async (c) => {
  const id = c.req.param("id");
  try {
    const data = await SystemService.approveTenant(id);
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.post("/registrations/:id/decline", async (c) => {
  const id = c.req.param("id");
  try {
    const data = await SystemService.declineTenant(id);
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.get("/tenants", async (c) => {
  try {
    const data = await SystemService.getAllTenants();
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.post("/registrations/:id/suspend", async (c) => {
  const id = c.req.param("id");
  try {
    const data = await SystemService.suspendTenant(id);
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.post("/registrations/:id/activate", async (c) => {
  const id = c.req.param("id");
  try {
    const data = await SystemService.activateTenant(id);
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
