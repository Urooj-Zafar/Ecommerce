// /api/admin/stats/route.js
import db from "@/Backend/db";
import { Order, Product, UserModel } from "@/Backend/models";
import { NextResponse } from "next/server";
import { VerifyToken } from "@/Backend/utils/jwt";

export async function GET(req) {
  try {
    await db();

    const token = req.cookies.get("EliteShop")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" 
          
        },
        { status: 401 }
      );
    }

    const user = VerifyToken(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const [totalOrders, totalProducts, totalUsers] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      UserModel.countDocuments(),
    ]);

    const orders = await Order.find({}, { total: 1 });
    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    // ✅ Fetch recent entries
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customer", "fullName userName email")
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
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}