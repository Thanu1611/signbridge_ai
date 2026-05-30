import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import {
  isGuestAllowedApi,
  isGuestAllowedPath,
  LOGIN_REQUIRED_MESSAGE,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/access";

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const secret = process.env.AUTH_SECRET;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!secret || secret.length < 16 || !token) return false;

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const authenticated = await hasValidSession(request);

  if (pathname.startsWith("/api")) {
    if (authenticated || isGuestAllowedApi(pathname)) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: LOGIN_REQUIRED_MESSAGE }, { status: 401 });
  }

  if (authenticated || isGuestAllowedPath(pathname)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("message", LOGIN_REQUIRED_MESSAGE);
  if (pathname !== "/login") {
    loginUrl.searchParams.set("from", pathname);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
