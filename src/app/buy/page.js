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

      // Use Buy Now products first.
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

          paymentMethod: "Cash On Delivery",
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

      // Clear checkout data
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
      {/* PAGE */}
      <div className="min-h-screen bg-gray-100 pt-24 pb-8 px-2 sm:px-5">

        {/* MAIN CONTAINER */}
        <div className="max-w-6xl w-full mx-auto">

          {/* CHECKOUT CARD */}
          <div className="bg-white rounded-2xl p-3 sm:p-5 md:p-8 shadow-sm w-full">

            {/* HEADING */}
            <h1 className="text-3xl sm:text-4xl font-bold mb-7 sm:mb-8 text-center">
              Checkout
            </h1>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">

              <div className="min-w-0">

                <h2 className="text-xl font-bold mb-5">
                  Your Products
                </h2>

                <div className="space-y-4">

                  {cart.map((item, index) => (

                    <div
                      key={item._id}
                      className="border border-gray-200
                                 rounded-xl
                                 p-3 sm:p-4
                                 w-full
                                 overflow-hidden
                                 hover:shadow-sm
                                 transition"
                    >

                      <div className="flex gap-3 sm:gap-4 min-w-0">

                        {/* PRODUCT IMAGE */}
                        <img
                          src={
                            item.images?.[0] ||
                            "/placeholder.png"
                          }
                          alt={item.title}
                          className="w-20 h-20
                                     sm:w-28 sm:h-28
                                     object-cover
                                     rounded-xl
                                     shrink-0"
                        />

                        {/* PRODUCT INFORMATION */}
                        <div className="flex-1 min-w-0 overflow-hidden">

                          {/* TITLE */}
                          <h3 className="text-base sm:text-lg
                                         font-semibold
                                         truncate">
                            {item.title}
                          </h3>

                          {/* PRICE */}
                          <p className="text-xl sm:text-2xl
                                        font-bold
                                        mt-1">
                            Rs.{" "}
                            {Number(
                              item.price || 0
                            ).toLocaleString()}
                          </p>

                          {/* SIZE + COLOR */}
                          <div className="flex flex-wrap
                                          items-center
                                          gap-2 sm:gap-3
                                          mt-3">

                            {/* SIZE */}
                            {item.selectedSize && (
                              <div className="flex items-center gap-2">

                                <span className="text-xs sm:text-sm
                                                 text-gray-500">
                                  Size
                                </span>

                                <span
                                  className="px-2.5 sm:px-3
                                             py-1
                                             border border-black
                                             rounded-lg
                                             text-xs sm:text-sm
                                             font-semibold
                                             whitespace-nowrap"
                                >
                                  {item.selectedSize}
                                </span>

                              </div>
                            )}

                            {/* COLOR */}
                            {item.selectedColor && (
                              <div className="flex items-center gap-2">

                                <span className="text-xs sm:text-sm
                                                 text-gray-500">
                                  Color
                                </span>

                                <span
                                  className="px-2.5 sm:px-3
                                             py-1
                                             border border-gray-200
                                             rounded-lg
                                             text-xs sm:text-sm
                                             font-medium
                                             flex items-center
                                             gap-2
                                             whitespace-nowrap"
                                >

                                  <span
                                    className="w-4 h-4
                                               rounded-full
                                               border border-gray-400
                                               shrink-0"
                                    style={{
                                      backgroundColor:
                                        item.selectedColor,
                                    }}
                                  />

                                  {item.selectedColor}

                                </span>

                              </div>
                            )}

                          </div>

                          {/* QUANTITY */}
                          <div className="flex items-center
                                          gap-3
                                          mt-4">

                            <button
                              type="button"
                              onClick={() =>
                                updateQty(
                                  index,
                                  Number(
                                    item.qty || 1
                                  ) - 1
                                )
                              }
                              className="w-8 h-8
                                         border border-gray-300
                                         rounded-lg
                                         hover:bg-gray-100
                                         transition
                                         flex items-center
                                         justify-center"
                            >
                              −
                            </button>

                            <span className="w-6
                                             text-center
                                             font-semibold">
                              {item.qty}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQty(
                                  index,
                                  Number(
                                    item.qty || 1
                                  ) + 1
                                )
                              }
                              className="w-8 h-8
                                         border border-gray-300
                                         rounded-lg
                                         hover:bg-gray-100
                                         transition
                                         flex items-center
                                         justify-center"
                            >
                              +
                            </button>

                          </div>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

                {/* TOTAL */}
                <div className="border-t border-gray-200
                                mt-6
                                pt-5">

                  <div className="flex justify-between
                                  items-center
                                  gap-4">

                    <span className="text-lg
                                     font-semibold">
                      Total
                    </span>

                    <span className="text-2xl sm:text-3xl
                                     font-bold
                                     whitespace-nowrap">
                      Rs. {total.toLocaleString()}
                    </span>

                  </div>

                </div>

              </div>

              <div className="min-w-0">

                <h2 className="text-xl font-bold mb-5">
                  Shipping Information
                </h2>

                <div className="flex flex-col gap-4">

                  {/* NAME */}
                  <input
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full
                               border border-gray-300
                               p-3
                               rounded-lg
                               outline-none
                               focus:border-black
                               transition"
                  />

                  {/* EMAIL */}
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full
                               border border-gray-300
                               p-3
                               rounded-lg
                               outline-none
                               focus:border-black
                               transition"
                  />

                  {/* ADDRESS */}
                  <input
                    name="address"
                    placeholder="Address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full
                               border border-gray-300
                               p-3
                               rounded-lg
                               outline-none
                               focus:border-black
                               transition"
                  />

                  {/* CITY */}
                  <input
                    name="city"
                    placeholder="City"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full
                               border border-gray-300
                               p-3
                               rounded-lg
                               outline-none
                               focus:border-black
                               transition"
                  />

                  {/* PAYMENT */}
                  <div className="border border-gray-200
                                  p-4
                                  rounded-xl
                                  bg-gray-50">

                    <p className="font-semibold">
                      Payment Method
                    </p>

                    <p className="text-gray-600 text-sm mt-1">
                      Cash on Delivery
                    </p>

                  </div>

                  {/* PLACE ORDER */}
                  <button
                    type="button"
                    onClick={proceedCheckout}
                    disabled={loading}
                    className="w-full
                               bg-black
                               text-white
                               py-3.5
                               rounded-xl
                               font-semibold
                               hover:bg-gray-800
                               transition
                               mt-2
                               disabled:opacity-50
                               disabled:cursor-not-allowed"
                  >
                    {loading
                      ? "Placing Order..."
                      : "Place Order"}
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* LOGIN MODAL */}
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
