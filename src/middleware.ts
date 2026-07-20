import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jwt from "jsonwebtoken";

// Note: Next.js edge runtime (middleware) doesn't support jsonwebtoken package natively if it uses Node APIs.
// However, since we are doing a manual verify, we might need a simpler check or use 'jose'.
// Let's use standard Request headers check for now, or just let the API routes check session.
// Wait, for Next.js App Router, middleware runs on Edge. We should use `jose` for JWT verify if needed.
// But for simplicity, we can just check if the auth_token cookie exists, and validate fully in layouts/API routes.
// Let's implement a basic cookie existence check for protected routes.

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith("/login");
  const isApi = request.nextUrl.pathname.startsWith("/api");
  const isPublicApi = request.nextUrl.pathname.startsWith("/api/auth");
  const isApiRequest = request.nextUrl.pathname.startsWith("/api/email");

  // Allow API key authenticated requests
  if (isApiRequest) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid API key" }, { status: 401 });
    }
    // API key validation will happen in the specific route handler.
    return NextResponse.next();
  }

  // Dashboard protection
  if (!isApi && !isAuthPage && request.nextUrl.pathname !== "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
