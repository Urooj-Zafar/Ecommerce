
import db from "@/Backend/db";
import { Order, Product, UserModel } from "@/Backend/models";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Connect to MongoDB
    await db();

    // Totals
    const [totalOrders, totalProducts, totalUsers] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      UserModel.countDocuments(),
    ]);

    // Revenue
    const orders = await Order.find({}, { total: 1 }); // fetch only 'total' field
    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Recent orders (latest 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Recent users (latest 5)
    const recentUsers = await UserModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
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
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}