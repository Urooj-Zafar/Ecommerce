import db from "@/Backend/db";
import { Order } from "@/Backend/models";
export async function DELETE(req, { params }) {
  try {
    await db();

    const { id } = await params;

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return Response.json(
        {
          error: "Order does not exist",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        message: "Order deleted successfully!",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("DELETE ORDER ERROR:", error);

    return Response.json(
      {
        error: "Failed to delete order",
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await db();

    const { id } = await params;
    const body = await req.json();

    const allowedStatuses = [
      "pending",
      "shipped",
      "delivered",
      "cancelled",
    ];

    const allowedPaymentStatuses = [
      "unpaid",
      "paid",
      "failed",
      "refunded",
    ];

    const updateData = {};

    if (body.status !== undefined) {
      if (!allowedStatuses.includes(body.status)) {
        return Response.json(
          { message: "Invalid order status" },
          { status: 400 }
        );
      }

      updateData.status = body.status;
    }

    if (body.paymentStatus !== undefined) {
      if (!allowedPaymentStatuses.includes(body.paymentStatus)) {
        return Response.json(
          { message: "Invalid payment status" },
          { status: 400 }
        );
      }

      updateData.paymentStatus = body.paymentStatus;
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json(
        { message: "No valid status provided" },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!order) {
      return Response.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Order updated successfully",
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE ORDER ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

