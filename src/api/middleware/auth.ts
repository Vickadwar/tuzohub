import { Context, Next } from "hono";
import { supabase } from "../../lib/supabase";
import { db } from "../../db";
import { users, tenants } from "../../db/schema";
import { eq } from "drizzle-orm";

export interface AuthContext {
  userId: string;
  tenantId: string | null;
  role: string | null;
  requiresPasswordChange: boolean;
}

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  try {
    console.log(`[Auth] Path: ${c.req.path}, Method: ${c.req.method}, AuthHeader present: ${!!authHeader}`);
    console.log(`[Auth] NODE_ENV: ${process.env.NODE_ENV}`);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized: Missing or invalid token" }, 401);
    }

    const token = authHeader.split(" ")[1];

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    // Lookup user in our DB to get tenantId and role
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      with: {
        tenant: true
      }
    }) as any;

    if (!dbUser) {
      return c.json({ error: "User not found in system" }, 403);
    }

    // ── TENANT STATUS CHECK ───────────────────────────────────────
    // Skip check for SYSTEM_ADMIN (they manage the platform)
    if (dbUser.role !== "SYSTEM_ADMIN" && dbUser.tenant) {
      if (dbUser.tenant.status === "pending") {
        return c.json({ 
          error: "Your account is pending approval. Our team will review it shortly.",
          code: "TENANT_PENDING" 
        }, 403);
      }
      if (dbUser.tenant.status === "declined") {
        return c.json({ 
          error: "Your registration request was declined. Please contact support for more details.",
          code: "TENANT_DECLINED" 
        }, 403);
      }
      if (dbUser.tenant.status === "suspended") {
        return c.json({ 
          error: "Your account has been suspended.",
          code: "TENANT_SUSPENDED" 
        }, 403);
      }
    }

    // Attach to context
    c.set("user", {
      userId: user.id,
      tenantId: dbUser.tenantId,
      role: dbUser.role,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
    });

    await next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return c.json({ error: "Internal Server Error during authentication" }, 500);
  }
};
