import { NextResponse } from "next/server";
import db from "@/Backend/db";
import { Order } from "@/Backend/models";
import { VerifyToken } from "@/helper/jwt";

export async function GET(req) {
  try {
    await db();

    const token = req.cookies.get("EliteShop")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login",
        },
        { status: 401 }
      );
    }

    const payload = VerifyToken(token);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired session",
        },
        { status: 401 }
      );
    }

    const orders = await Order.find({
      user: payload.id,
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("MY ORDERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}