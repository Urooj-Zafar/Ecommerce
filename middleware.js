// middleware.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const url = req.nextUrl.clone();

  // Protect /admin and its subroutes
  if (url.pathname.startsWith("/admin")) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== "admin") {
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    } catch (err) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};