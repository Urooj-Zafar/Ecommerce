import db from "@/Backend/db";
import { Product } from "@/Backend/models";

export async function GET(req, { params }) {
  try {
    await db();

    const { id } = await params;

    const product = await Product.findById(id).populate("category");

    if (!product) {
      return Response.json(
        {
          error: "Product does not exist",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(product, {
      status: 200,
    });
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);

    return Response.json(
      {
        error: "Failed to fetch product",
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await db();

    const { id } = await params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return Response.json(
        {
          error: "Product does not exist",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        message: "Product deleted successfully!",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return Response.json(
      {
        error: "Failed to delete product",
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
    const editPro = await req.json();

    const product = await Product.findByIdAndUpdate(
      id,
      editPro,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return Response.json(
        {
          error: "Product does not exist",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        message: "Product updated successfully!",
        product,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return Response.json(
      {
        error: "Failed to update product",
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}