import { Hono } from "hono";
import { z } from "zod";
import { LocationsService } from "../../services/locations.service";
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

app.get("/countries", async (c) => {
  try {
    const { countries } = await import("../../db/schema");
    const records = await db.select().from(countries);
    return c.json({ success: true, data: records });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// ─── REGIONS ─────────────────────────────────────────────────────────────

app.get("/regions", async (c) => {
  try {
    const { userId, tenantId, role } = await getAuthContext(c);
    const regions = await withScopedDb(userId, role, async (tx) => {
      return await LocationsService.getRegionsWithCountryName(tenantId, tx);
    });
    return c.json({ success: true, data: regions });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.get("/regions/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const { userId, tenantId, role } = await getAuthContext(c);
    const region = await withScopedDb(userId, role, async (tx) => {
      return await LocationsService.getRegionById(id, tenantId, tx);
    });
    return c.json({ success: true, data: region });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 404);
  }
});

const createRegionSchema = z.object({
  name: z.string().min(1, "Region name is required"),
  countryId: z.string().optional().nullable().transform(v => (v && v.trim() ? v.trim() : undefined)),
});

app.post("/regions", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = createRegionSchema.safeParse(body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return c.json({ success: false, error: errorMsg }, 400);
    }
    const { userId, tenantId, role } = await getAuthContext(c);
    const region = await withScopedDb(userId, role, async (tx) => {
      return await LocationsService.createRegion({ ...parsed.data, tenantId }, tx);
    });
    return c.json({ success: true, data: region });
  } catch (error: any) {
    console.error("[POST /api/locations/regions Error]", error);
    return c.json({ success: false, error: error.message }, 400);
  }
});

const updateRegionSchema = z.object({
  name: z.string().min(1).optional(),
  countryId: z.string().optional().nullable().transform(v => (v && v.trim() ? v.trim() : undefined)),
});

app.put("/regions/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const parsed = updateRegionSchema.safeParse(body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return c.json({ success: false, error: errorMsg }, 400);
    }
    const { userId, tenantId, role } = await getAuthContext(c);
    const region = await withScopedDb(userId, role, async (tx) => {
      return await LocationsService.updateRegion(id, parsed.data, tenantId, tx);
    });
    return c.json({ success: true, data: region });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.delete("/regions/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const { userId, tenantId, role } = await getAuthContext(c);
    await withScopedDb(userId, role, async (tx) => {
      return await LocationsService.deleteRegion(id, tenantId, tx);
    });
    return c.json({ success: true, message: "Region deleted successfully" });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// ─── TOWNS ───────────────────────────────────────────────────────────────

app.get("/towns", async (c) => {
  try {
    const { userId, tenantId, role } = await getAuthContext(c);
    const towns = await withScopedDb(userId, role, async (tx) => {
      return await LocationsService.getTownsWithRegionName(tenantId, tx);
    });
    return c.json({ success: true, data: towns });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.get("/towns/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const { userId, tenantId, role } = await getAuthContext(c);
    const town = await withScopedDb(userId, role, async (tx) => {
      return await LocationsService.getTownById(id, tenantId, tx);
    });
    return c.json({ success: true, data: town });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 404);
  }
});

const createTownSchema = z.object({
  name: z.string().min(1, "Town name is required"),
  regionId: z.string().min(1, "Region selection is required"),
  countyId: z.string().optional().nullable().transform(v => (v && v.trim() ? v.trim() : undefined)),
});

app.post("/towns", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = createTownSchema.safeParse(body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return c.json({ success: false, error: errorMsg }, 400);
    }
    const { userId, tenantId, role } = await getAuthContext(c);
    const town = await withScopedDb(userId, role, async (tx) => {
      return await LocationsService.createTown({ ...parsed.data, tenantId }, tx);
    });
    return c.json({ success: true, data: town });
  } catch (error: any) {
    console.error("[POST /api/locations/towns Error]", error);
    return c.json({ success: false, error: error.message }, 400);
  }
});

const updateTownSchema = z.object({
  name: z.string().min(1).optional(),
  regionId: z.string().optional(),
  countyId: z.string().optional().nullable().transform(v => (v && v.trim() ? v.trim() : undefined)),
});

app.put("/towns/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const parsed = updateTownSchema.safeParse(body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return c.json({ success: false, error: errorMsg }, 400);
    }
    const { userId, tenantId, role } = await getAuthContext(c);
    const town = await withScopedDb(userId, role, async (tx) => {
      return await LocationsService.updateTown(id, parsed.data, tenantId, tx);
    });
    return c.json({ success: true, data: town });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.delete("/towns/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const { userId, tenantId, role } = await getAuthContext(c);
    await withScopedDb(userId, role, async (tx) => {
      return await LocationsService.deleteTown(id, tenantId, tx);
    });
    return c.json({ success: true, message: "Town deleted successfully" });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

export default app;
