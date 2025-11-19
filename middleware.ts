import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "traceabilitytools-admin";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const session = request.cookies.get(SESSION_COOKIE)?.value;
    const accessKey = process.env.ADMIN_ACCESS_KEY ?? "dev-admin";
    if (session !== accessKey) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
