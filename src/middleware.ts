// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // read from query
  const clickId =
    url.searchParams.get("clickid") ||
    url.searchParams.get("click_id") ||
    url.searchParams.get("clickId");

  let res: NextResponse;

  if (clickId) {
    res = NextResponse.redirect(url);
  } else {
    res = NextResponse.next();
  }

  if (clickId) {
    res.cookies.set("clickid", clickId, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });
  }
};

// apply to all app routes
export const config = {
  matcher: ["/:path*"],
};