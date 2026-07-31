import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // Use getUser() for better security and server-side validation
  const { data: { user } } = await supabase.auth.getUser();

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isRootPath = request.nextUrl.pathname === "/";
  
  // Publicly accessible pages that do not require authentication
  const isPublicPage = 
    isRootPath ||
    isAuthPage ||
    request.nextUrl.pathname.startsWith("/terms") ||
    request.nextUrl.pathname.startsWith("/privacy") ||
    request.nextUrl.pathname.startsWith("/security") ||
    request.nextUrl.pathname.startsWith("/docs") ||
    request.nextUrl.pathname.startsWith("/documentation") ||
    request.nextUrl.pathname.startsWith("/r");
  
  // 1. If logged in and on an auth page, redirect to overview
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  // 2. If NOT logged in and trying to access a protected page, redirect to login
  if (!user && !isPublicPage) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - images (public images)
     * - favicon.ico (favicon file)
     */
    "/((?!api|ussd|sms|mpesa|public|_next/static|_next/image|images|favicon.ico).*)",
  ],
};
