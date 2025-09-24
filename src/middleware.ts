import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { unsealData } from "iron-session";
import { sessionOptions } from "@/lib/session-config";
import type { SessionData } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/api/health"];

async function readSessionFromRequest(request: NextRequest): Promise<SessionData | null> {
  const cookie = request.cookies.get(sessionOptions.cookieName);
  if (!cookie) {
    return null;
  }

  try {
    const data = await unsealData<SessionData>(cookie.value, {
      password: sessionOptions.password,
      ttl: sessionOptions.ttl,
    });
    return data;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  const session = await readSessionFromRequest(request);
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!session?.userId && !isPublic) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    if (pathname !== "/") {
      redirectUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (session?.userId && pathname === "/login") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/dashboard";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.well-known|_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
