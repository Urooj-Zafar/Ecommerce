import { NextResponse } from "next/server";
import db from "@/Backend/db";
import { Order } from "@/Backend/models";
import { VerifyToken } from "@/helper/jwt";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "No products in order",
        },
        { status: 400 }
      );
    }

    const order = await Order.create({
      user: payload.id,
      customer,
      items,
      total,
      paymentMethod: paymentMethod || "COD",
    });

    const productsHTML = items
      .map(
        (item) => `
          <div style="
            border:1px solid #ddd;
            border-radius:10px;
            padding:15px;
            margin-bottom:15px;
          ">
            <h3>${item.title}</h3>

            <p>
              Price: $${item.price}
            </p>

            <p>
              Quantity: ${item.qty}
            </p>

            ${
              item.size
                ? `<p>Size: ${item.size}</p>`
                : ""
            }

            ${
              item.color
                ? `<p>Color: ${item.color}</p>`
                : ""
            }
          </div>
        `
      )
      .join("");

    let emailSent = false;

    try {
      const { data, error } =
        await resend.emails.send({
          from:
            process.env.EMAIL_FROM,

          to: [customer.email],

          subject: `EliteShop Order Confirmation #${order._id}`,

          html: `
            <div style="
              font-family:Arial,sans-serif;
              max-width:650px;
              margin:auto;
              padding:20px;
              color:#222;
            ">

              <h1>
                Order Confirmed 🎉
              </h1>

              <p>
                Hi ${customer.name},
              </p>

              <p>
                Thank you for shopping with EliteShop.
                Your order has been successfully placed.
              </p>

              <hr />

              <h2>
                Order Details
              </h2>

              <p>
                <strong>Order ID:</strong>
                ${order._id}
              </p>

              <p>
                <strong>Order Date:</strong>
                ${new Date(
                  order.createdAt
                ).toLocaleString()}
              </p>

              <p>
                <strong>Payment:</strong>
                ${paymentMethod || "COD"}
              </p>

              <p>
                <strong>Status:</strong>
                ${order.status}
              </p>

              <hr />

              <h2>
                Products
              </h2>

              ${productsHTML}

              <hr />

              <h2>
                Total: $${total}
              </h2>

              <h2>
                Shipping Information
              </h2>

              <p>
                <strong>Name:</strong>
                ${customer.name}
              </p>

              <p>
                <strong>Email:</strong>
                ${customer.email}
              </p>

              <p>
                <strong>Address:</strong>
                ${customer.address}
              </p>

              <p>
                <strong>City:</strong>
                ${customer.city}
              </p>

              <hr />

              <p>
                We will process your order and notify you
                when your order is shipped.
              </p>

              <p>
                Thank you for choosing EliteShop.
              </p>

            </div>
          `,
        });

      if (error) {
        console.error(
          "RESEND EMAIL ERROR:",
          error
        );
      } else {
        console.log(
          "Confirmation email sent:",
          data
        );

        emailSent = true;
      }
    } catch (emailError) {
      console.error(
        "EMAIL ERROR:",
        emailError
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: emailSent
          ? "Order placed successfully and confirmation email sent"
          : "Order placed successfully, but confirmation email could not be sent",
        order,
        emailSent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Server error while placing order",
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