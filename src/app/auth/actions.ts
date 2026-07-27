"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // ── TENANT STATUS CHECK (Server Side) ──────────────────────────
  const authUser = data.user;
  if (authUser) {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, authUser.id),
      with: { tenant: true }
    }) as any;

    // Super admins bypass tenant status checks — go straight to platform
    if (dbUser?.role === "SYSTEM_ADMIN") {
      return { success: true, redirectUrl: "/platform/dashboard" };
    }

    // For all other roles, enforce tenant status gates
    if (dbUser && dbUser.tenant) {
      if (dbUser.tenant.status === "pending") {
        await supabase.auth.signOut();
        return { error: "Your account is pending approval. Please wait for our team to verify your registration." };
      }
      if (dbUser.tenant.status === "declined") {
        await supabase.auth.signOut();
        return { error: "Your registration request was declined. Contact support for more details." };
      }
      if (dbUser.tenant.status === "suspended") {
        await supabase.auth.signOut();
        return { error: "Your account has been suspended." };
      }
    }
  }

  // All clear — return redirect destination for instant browser navigation
  return { success: true, redirectUrl: "/overview" };
}

export async function signOut() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  await supabase.auth.signOut();
  return { success: true };
}
