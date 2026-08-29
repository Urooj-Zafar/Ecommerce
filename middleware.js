import { NextResponse } from "next/server";
import { VerifyToken } from "@/helper/jwt";

export function middleware(req) {
  const token = req.cookies.get("EliteShop")?.value;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.json(
        { error: "NO TOKEN" },
        { status: 401 }
      );
    }

    const payload = VerifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "INVALID TOKEN" },
        { status: 401 }
      );
    }

    if (payload.role?.toLowerCase() !== "admin") {
      return NextResponse.json(
        {
          error: "NOT ADMIN",
          role: payload.role,
        },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/BuyNow/:path*",
    "/Checkout/:path*",
  ],
};