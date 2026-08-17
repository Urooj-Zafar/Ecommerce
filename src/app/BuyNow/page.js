"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Login from "@/components/Login";

export default function BuyNow() {
  const router = useRouter();

  const [cart, setCart] = useState([]);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    paymentMethod: "COD",
  });

  // Load products for checkout
  useEffect(() => {
    try {
      const savedCart =
        JSON.parse(localStorage.getItem("cart")) || [];

      const savedBuyNow =
        JSON.parse(localStorage.getItem("buyNow")) || [];

      // First use buyNow if it exists.
      // Otherwise use normal cart.
      const products =
        savedBuyNow.length > 0
          ? savedBuyNow
          : savedCart;

      if (!products.length) {
        toast.error("No product selected");
        router.push("/products");
        return;
      }

      setCart(products);
    } catch (error) {
      console.error("Checkout loading error:", error);

      localStorage.removeItem("buyNow");

      toast.error("Unable to load products");
      router.push("/products");
    }
  }, [router]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const updateQty = (index, qty) => {
    if (qty < 1) return;

    const newCart = [...cart];

    if (
      newCart[index].stock &&
      qty > newCart[index].stock
    ) {
      toast.error("Stock limit reached");
      return;
    }

    newCart[index] = {
      ...newCart[index],
      qty,
    };

    setCart(newCart);

    // If this checkout came from Buy Now
    const buyNow =
      JSON.parse(localStorage.getItem("buyNow")) || [];

    if (buyNow.length > 0) {
      localStorage.setItem(
        "buyNow",
        JSON.stringify(newCart)
      );
    } else {
      localStorage.setItem(
        "cart",
        JSON.stringify(newCart)
      );

      window.dispatchEvent(
        new Event("cartUpdated")
      );
    }
  };

  const proceedCheckout = async () => {
    if (loading) return;

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.address.trim() ||
      !form.city.trim()
    ) {
      toast.error("Fill all fields");
      return;
    }

    if (!cart.length) {
      toast.error("No product selected");
      return;
    }

    try {
      setLoading(true);

      const total = cart.reduce(
        (sum, item) =>
          sum +
          Number(item.price || 0) *
            Number(item.qty || 0),
        0
      );

      const res = await fetch("/api/orders", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          customer: {
            name: form.name,
            email: form.email,
            address: form.address,
            city: form.city,
          },

          items: cart.map((product) => ({
            product: product._id,
            title: product.title,
            price: Number(product.price),
            image: product.images?.[0] || "",
            size: product.selectedSize || "",
            color: product.selectedColor || "",
            qty: Number(product.qty || 1),
          })),

          total,

          paymentMethod: "COD",
        }),
      });

      const data = await res.json();

      // User is not logged in
      if (res.status === 401) {
        setLoginOpen(true);
        return;
      }

      if (!res.ok || !data.success) {
        toast.error(
          data.message || "Order failed"
        );
        return;
      }

      toast.success(
        "Order placed successfully!"
      );

      // Clear both
      localStorage.removeItem("cart");
      localStorage.removeItem("buyNow");
      localStorage.removeItem("checkoutData");

      window.dispatchEvent(
        new Event("cartUpdated")
      );

      router.push("/");
    } catch (error) {
      console.error(
        "ORDER ERROR:",
        error
      );

      toast.error(
        "Something went wrong while placing the order"
      );
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  const total = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.qty || 0),
    0
  );

  return (
    <>
      <div className="min-h-screen flex justify-center items-center bg-gray-50 p-8">
        <div className="max-w-5xl w-full bg-white border rounded-xl p-8">

          <h1 className="text-3xl font-bold mb-8">
            Checkout
          </h1>

          <div className="grid md:grid-cols-2 gap-8">

            {/* PRODUCTS */}

            <div>
              <h2 className="text-xl font-bold mb-4">
                Your Products
              </h2>

              <div className="space-y-5">
                {cart.map((item, index) => (
                  <div
                    key={item._id}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex gap-4">

                      <img
                        src={
                          item.images?.[0] ||
                          "/placeholder.png"
                        }
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded"
                      />

                      <div className="flex-1">

                        <h3 className="font-bold">
                          {item.title}
                        </h3>

                        <p className="text-gray-600">
                          ${item.price}
                        </p>

                        {item.selectedSize && (
                          <p>
                            Size: {item.selectedSize}
                          </p>
                        )}

                        {item.selectedColor && (
                          <p>
                            Color: {item.selectedColor}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-3">

                          <button
                            onClick={() =>
                              updateQty(
                                index,
                                item.qty - 1
                              )
                            }
                            className="border px-3 py-1 rounded"
                          >
                            -
                          </button>

                          <span>
                            {item.qty}
                          </span>

                          <button
                            onClick={() =>
                              updateQty(
                                index,
                                item.qty + 1
                              )
                            }
                            className="border px-3 py-1 rounded"
                          >
                            +
                          </button>

                        </div>

                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-2xl font-bold mt-6">
                Total: ${total}
              </p>
            </div>

            {/* SHIPPING */}

            <div className="flex flex-col gap-4">

              <h2 className="text-xl font-bold">
                Shipping Information
              </h2>

              <input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="border p-3 rounded"
              />

              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="border p-3 rounded"
              />

              <input
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                className="border p-3 rounded"
              />

              <input
                name="city"
                placeholder="City"
                value={form.city}
                onChange={handleChange}
                className="border p-3 rounded"
              />

              <div className="border p-3 rounded bg-gray-50">
                <p className="font-medium">
                  Payment Method
                </p>

                <p className="text-gray-600">
                  Cash on Delivery
                </p>
              </div>

              <button
                onClick={proceedCheckout}
                disabled={loading}
                className="bg-black text-white py-3 rounded mt-4 disabled:opacity-50"
              >
                {loading
                  ? "Placing Order..."
                  : "Place Order"}
              </button>

            </div>
          </div>
        </div>
      </div>

      {loginOpen && (
        <Login
          onClose={() =>
            setLoginOpen(false)
          }
        />
      )}
    </>
  );
}