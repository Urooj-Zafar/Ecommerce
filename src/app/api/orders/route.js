import { NextResponse } from "next/server";
import db from "@/Backend/db";
import { VerifyToken } from "@/helper/jwt";
import { Order, Product } from "@/Backend/models";
export async function POST(req) {
  try {
    await db();

    const token = req.cookies.get("EliteShop")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to place an order",
        },
        { status: 401 }
      );
    }

    const payload = VerifyToken(token);

    if (!payload || !payload.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired login session",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      customer,
      items,
      total,
      paymentMethod,
    } = body;

    if (
      !customer ||
      !customer.name ||
      !customer.email ||
      !customer.address ||
      !customer.city
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer information is required",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No products in order",
        },
        { status: 400 }
      );
    }

    // DECREASE STOCK
    for (const item of items) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: { $gte: item.qty },
        },
        {
          $inc: {
            stock: -item.qty,
          },
        },
        {
          new: true,
        }
      );

      if (!updatedProduct) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for ${item.title}`,
          },
          { status: 400 }
        );
      }
    }

    // CREATE ORDER
    const order = await Order.create({
      user: payload.id,
      customer,
      items,
      total,
      paymentMethod: paymentMethod || "COD",
    });

    // YOUR EMAIL CODE CONTINUES HERE...

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error while placing order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await db();

    const orders = await Order.find()
      .populate("items.product")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error while fetching orders",
      },
      { status: 500 }
    );
  }
}