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