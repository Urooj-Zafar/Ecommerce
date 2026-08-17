import { NextResponse } from "next/server";
import { VerifyToken } from "@/helper/jwt";

export function middleware(req) {
  const token =
    req.cookies.get("EliteShop")?.value;

  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {

    if (!token) {
      return NextResponse.redirect(
        new URL("/", req.url)
      );
    }

    const payload = VerifyToken(token);

    if (
      !payload ||
      payload.role !== "admin"
    ) {
      return NextResponse.redirect(
        new URL("/", req.url)
      );
    }
  }


  if (
    pathname.startsWith("/BuyNow") ||
    pathname.startsWith("/Checkout")
  ) {

    if (!token) {
      return NextResponse.redirect(
        new URL("/login", req.url)
      );
    }

    const payload = VerifyToken(token);

    if (!payload) {
      return NextResponse.redirect(
        new URL("/login", req.url)
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