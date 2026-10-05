import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const s = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && (!s || s.role !== "ADMIN")) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, req.url));
  }
  if (pathname.startsWith("/profile") && !s) {
    return NextResponse.redirect(new URL(`/login?next=/profile`, req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/profile/:path*"] };
