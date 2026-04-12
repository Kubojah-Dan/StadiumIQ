import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, decodeSessionCookie } from "./lib/auth";

function isAuthed(req: NextRequest) {
  const rawCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!rawCookie) return false;
  const parsed = decodeSessionCookie(rawCookie);
  if (!parsed) return false;
  return parsed.exp > Date.now();
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = isAuthed(req);

  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isSettings = pathname === "/settings" || pathname.startsWith("/settings/");
  const isAuthPage = pathname === "/login" || pathname.startsWith("/login/") || pathname === "/signup" || pathname.startsWith("/signup/");

  if ((isDashboard || isSettings) && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/login", "/signup"],
};
