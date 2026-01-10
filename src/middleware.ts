import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isOnLogin = pathname === "/login";
  const isAdmin = pathname.startsWith("/admin");

  const sessionToken =
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value;

  const isLoggedIn = !!sessionToken;

  const debugHeaders: Record<string, string> = {};

  if (process.env.NODE_ENV === "development") {
    debugHeaders["x-debug-logged-in"] = String(isLoggedIn);
    debugHeaders["x-debug-path"] = pathname;
    debugHeaders["x-debug-cookies"] = request.cookies
      .getAll()
      .map((c) => c.name)
      .join(",");
  }

  if (isOnLogin && isLoggedIn) {
    const callbackUrl =
      request.nextUrl.searchParams.get("callbackUrl") || "/admin";
    const response = NextResponse.redirect(new URL(callbackUrl, request.url));
    Object.entries(debugHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  if (isAdmin && !isLoggedIn) {
    const response = NextResponse.redirect(
      new URL(`/login?callbackUrl=${pathname}`, request.url),
    );
    Object.entries(debugHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  const response = NextResponse.next();
  Object.entries(debugHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
