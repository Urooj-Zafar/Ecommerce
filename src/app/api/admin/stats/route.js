import db from "@/Backend/db";
import { Order, Product, UserModel } from "@/Backend/models";
import { NextResponse } from "next/server";
import { VerifyToken } from "@/helper/jwt";

export async function GET(req) {
  try {
    await db();

    const token = req.cookies.get("EliteShop")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const user = VerifyToken(token);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
        },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 }
      );
    }

    const [
      totalOrders,
      totalProducts,
      totalUsers,
    ] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      UserModel.countDocuments(),
    ]);

    const paidOrders = await Order.find({
      paymentStatus: "paid",
      status: { $ne: "cancelled" },
    })
      .select("total")
      .lean();

    const revenue = paidOrders.reduce(
      (sum, order) => sum + (Number(order.total) || 0),
      0
    );

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentUsers = await UserModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password")
      .lean();

    return NextResponse.json({
      success: true,

      stats: {
        orders: totalOrders,
        products: totalProducts,
        users: totalUsers,
        revenue,
      },

      recentOrders,
      recentUsers,
    });
  } catch (error) {
    console.error("Stats API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
