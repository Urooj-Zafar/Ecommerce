import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export async function sendOrderEmail(order) {
  const {
    customer,
    items,
    total,
    paymentMethod,
    status,
    createdAt,
  } = order;

  const orderId = order._id
    .toString()
    .slice(-8)
    .toUpperCase();

  const orderDate = new Date(
    createdAt
  ).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const itemsHtml = items
    .map(
      (item) => `
        <div
          style="
            display:flex;
            gap:16px;
            padding:16px 0;
            border-bottom:1px solid #e5e5e5;
          "
        >

          ${
            item.image
              ? `
                <img
                  src="${item.image}"
                  alt="${item.title}"
                  width="90"
                  height="90"
                  style="
                    width:90px;
                    height:90px;
                    object-fit:cover;
                    border-radius:8px;
                    border:1px solid #ddd;
                  "
                />
              `
              : ""
          }

          <div>
            <h3 style="margin:0 0 8px;">
              ${item.title}
            </h3>

            <p style="margin:4px 0;">
              Price: $${Number(item.price).toFixed(2)}
            </p>

            <p style="margin:4px 0;">
              Quantity: ${item.qty}
            </p>

            ${
              item.size
                ? `
                  <p style="margin:4px 0;">
                    Size: ${item.size}
                  </p>
                `
                : ""
            }

            ${
              item.color
                ? `
                  <p style="margin:4px 0;">
                    Color: ${item.color}
                  </p>
                `
                : ""
            }
          </div>

        </div>
      `
    )
    .join("");

  const { data, error } =
    await resend.emails.send({
      from:
        process.env.EMAIL_FROM ||
        "EliteShop <onboarding@resend.dev>",

      to: [customer.email],

      subject:
        `EliteShop - Order #${orderId} Confirmed`,

      html: `
        <!DOCTYPE html>

        <html>

        <body
          style="
            margin:0;
            padding:0;
            background:#f5f5f5;
            font-family:Arial,sans-serif;
            color:#222;
          "
        >

          <div
            style="
              max-width:700px;
              margin:30px auto;
              background:white;
              padding:30px;
              border-radius:12px;
            "
          >

            <h1
              style="
                margin-top:0;
                text-align:center;
              "
            >
              EliteShop
            </h1>

            <h2>
              Order Confirmed
            </h2>

            <p>
              Hello ${customer.name},
            </p>

            <p>
              Thank you for shopping with
              EliteShop.
              Your order has been successfully
              placed.
            </p>

            <div
              style="
                background:#f5f5f5;
                padding:16px;
                border-radius:8px;
                margin:20px 0;
              "
            >

              <p>
                <strong>Order ID:</strong>
                #${orderId}
              </p>

              <p>
                <strong>Order Date:</strong>
                ${orderDate}
              </p>

              <p>
                <strong>Payment:</strong>
                ${paymentMethod}
              </p>

              <p>
                <strong>Status:</strong>
                ${status}
              </p>

            </div>

            <h2>
              Ordered Products
            </h2>

            ${itemsHtml}

            <div
              style="
                text-align:right;
                margin-top:20px;
                font-size:20px;
              "
            >
              <strong>
                Total: $${Number(total).toFixed(2)}
              </strong>
            </div>

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

            <div
              style="
                margin-top:30px;
                padding-top:20px;
                border-top:1px solid #ddd;
                text-align:center;
                color:#666;
              "
            >
              <p>
                Thank you for choosing EliteShop.
              </p>

              <p>
                We will process your order shortly.
              </p>
            </div>

          </div>

        </body>

        </html>
      `,
    });

  if (error) {
    console.error(
      "RESEND EMAIL ERROR:",
      error
    );

    throw new Error(
      error.message ||
        "Failed to send order email"
    );
  }

  return data;
}