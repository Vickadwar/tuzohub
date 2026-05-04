import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { LocationsService } from "../../services/locations.service";
import { withScopedDb } from "../../db";

const app = new Hono<{ Variables: { user: any } }>();

// ─── REGIONS ─────────────────────────────────────────────────────────────

app.get("/regions", async (c) => {
  const user = c.get("user");
  try {
    const regions = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await LocationsService.getRegionsWithCountryName(user.tenantId, tx);
    });
    return c.json({ success: true, data: regions });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.get("/regions/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  try {
    const region = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await LocationsService.getRegionById(id, user.tenantId, tx);
    });
    return c.json({ success: true, data: region });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 404);
  }
});

const createRegionSchema = z.object({
  name: z.string().min(1),
  countryId: z.string().uuid(),
});

app.post("/regions", zValidator("json", createRegionSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");
  try {
    const region = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await LocationsService.createRegion({ ...body, tenantId: user.tenantId }, tx);
    });
    return c.json({ success: true, data: region });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

const updateRegionSchema = z.object({
  name: z.string().min(1).optional(),
  countryId: z.string().uuid().optional(),
});

app.put("/regions/:id", zValidator("json", updateRegionSchema), async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = c.req.valid("json");
  try {
    const region = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await LocationsService.updateRegion(id, body, user.tenantId, tx);
    });
    return c.json({ success: true, data: region });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.delete("/regions/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  try {
    await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await LocationsService.deleteRegion(id, user.tenantId, tx);
    });
    return c.json({ success: true, message: "Region deleted successfully" });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// ─── TOWNS ───────────────────────────────────────────────────────────────

app.get("/towns", async (c) => {
  const user = c.get("user");
  try {
    const towns = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await LocationsService.getTownsWithRegionName(user.tenantId, tx);
    });
    return c.json({ success: true, data: towns });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.get("/towns/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  try {
    const town = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await LocationsService.getTownById(id, user.tenantId, tx);
    });
    return c.json({ success: true, data: town });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 404);
  }
});

const createTownSchema = z.object({
  name: z.string().min(1),
  regionId: z.string().uuid(),
  countyId: z.string().uuid().optional(),
});

app.post("/towns", zValidator("json", createTownSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");
  try {
    const town = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await LocationsService.createTown({ ...body, tenantId: user.tenantId }, tx);
    });
    return c.json({ success: true, data: town });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

const updateTownSchema = z.object({
  name: z.string().min(1).optional(),
  regionId: z.string().uuid().optional(),
  countyId: z.string().uuid().optional(),
});

app.put("/towns/:id", zValidator("json", updateTownSchema), async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = c.req.valid("json");
  try {
    const town = await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await LocationsService.updateTown(id, body, user.tenantId, tx);
    });
    return c.json({ success: true, data: town });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.delete("/towns/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  try {
    await withScopedDb(user.userId, user.role || "authenticated", async (tx) => {
      return await LocationsService.deleteTown(id, user.tenantId, tx);
    });
    return c.json({ success: true, message: "Town deleted successfully" });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
