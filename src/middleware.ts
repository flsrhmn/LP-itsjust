// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  const clickId =
    url.searchParams.get("clickid") ||
    url.searchParams.get("click_id") ||
    url.searchParams.get("clickId");

  // just continue the request
  const res = NextResponse.next();

  // if clickId exists, store it in cookie (for layout.tsx)
  if (clickId) {
    res.cookies.set("clickid", clickId, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });
  }

  return res;
}

// apply to all app routes
export const config = {
  matcher: ["/:path*"],
};
