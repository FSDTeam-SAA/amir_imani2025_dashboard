import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

function isAdminRole(role?: unknown): boolean {
  if (!role || typeof role !== "string") return false;
  const normalized = role.toLowerCase().replace(/[\s_-]/g, "");
  return normalized === "admin" || normalized === "superadmin";
}

function checkIsAdmin(token: Record<string, any> | null): boolean {
  if (!token) return false;
  const role = token.role || token.user?.role;
  if (isAdminRole(role)) return true;
  if (Array.isArray(token.roles)) {
    return token.roles.some((r: unknown) => isAdminRole(r));
  }
  return false;
}

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = [
    "/login",
    "/forget-password",
    "/reset-password",
    "/verify-otp",
  ];
  const isPublicPath = publicPaths.some(
    (path) => pathname.startsWith(`/(auth)${path}`) || pathname === path
  );

  const isAdmin = checkIsAdmin(token);

  // If user is authenticated and tries to access auth pages
  if (token && isPublicPath) {
    if (isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    // Authenticated non-admin on public path: clear invalid session cookies
    const response = NextResponse.next();
    response.cookies.delete("next-auth.session-token");
    response.cookies.delete("__Secure-next-auth.session-token");
    return response;
  }

  // If user is not authenticated and tries to access protected paths
  if (!token && !isPublicPath && !pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If user is authenticated but NOT an admin and tries to access protected paths
  if (token && !isAdmin && !isPublicPath && !pathname.startsWith("/api")) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("error", "AccessDenied");
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("next-auth.session-token");
    response.cookies.delete("__Secure-next-auth.session-token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|images|assets|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp).*)",
  ],
};
