import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

async function verifyToken(token) {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET
    );

    const { payload } = await jwtVerify(token, secret);

    return payload;
  } catch (error) {
    console.error("JWT ERROR:", error);
    return null;
  }
}

export async function middleware(req) {
  const token = req.cookies.get("EliteShop")?.value;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(
        new URL("/", req.url)
      );
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.redirect(
        new URL("/", req.url)
      );
    }

    if (payload.role?.toLowerCase() !== "admin") {
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

    const payload = await verifyToken(token);

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