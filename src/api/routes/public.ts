import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { SystemService } from "../../services/system.service";

const app = new Hono();

const registerSchema = z.object({
  tenantName: z.string().min(2),
  orgEmail: z.string().email(),
  orgPhone: z.string().optional(),
  taxPin: z.string().optional(),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  countryId: z.string().uuid(),
});

app.get("/countries", async (c) => {
  try {
    const data = await SystemService.getCountries();
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.post("/register-tenant", zValidator("json", registerSchema), async (c) => {
  const body = c.req.valid("json");
  try {
    const result = await SystemService.registerTenantRequest(body);
    return c.json({ 
      success: true, 
      message: "Registration received! Your account is pending approval.",
      data: result 
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
