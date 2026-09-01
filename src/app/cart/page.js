"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, []);

  const updateCart = (index, qty) => {
    if (qty < 1) return;

    const newCart = [...cart];

    if (qty > newCart[index].stock) {
      toast.error("Stock limit reached");
      return;
    }

    newCart[index].qty = qty;
    setCart(newCart);

    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);

    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const totalPrice = cart.reduce(
    (acc, item) => acc + Number(item.price) * Number(item.qty),
    0
  );

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    router.push("/buy");
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-xl">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-10 pt-28 pb-10">
      <div className="bg-white rounded-2xl p-3 sm:p-5 md:p-8 shadow-sm w-full">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
        Your Cart
      </h1>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">

        {/* CART ITEMS */}
        <div className="space-y-4">

          {cart.map((item, index) => (

            <div
              key={item._id}
              className="border border-gray-200 rounded-2xl p-4 sm:p-5
                         flex gap-4 sm:gap-6
                         hover:shadow-md transition"
            >

              {/* IMAGE */}
              <img
                src={item.images?.[0]}
                alt={item.title}
                className="w-28 h-28 sm:w-36 sm:h-36
                           object-cover rounded-xl shrink-0"
              />

              {/* DETAILS */}
              <div className="flex-1 min-w-0">

                {/* TITLE */}
                <h2 className="text-lg sm:text-xl font-semibold truncate">
                  {item.title}
                </h2>

                {/* PRICE */}
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-bold">
                    Rs. {Number(item.price).toLocaleString()}
                  </span>
                </div>

                {/* SIZE + COLOR */}
                <div className="flex flex-wrap items-center gap-3 mt-4">

                  {/* SIZE */}
                  {item.selectedSize && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        Size
                      </span>

                      <span
                        className="px-3 py-1 rounded-lg
                                   border border-black
                                   text-sm font-semibold
                                   bg-white"
                      >
                        {item.selectedSize}
                      </span>
                    </div>
                  )}

                  {/* COLOR */}
                  {item.selectedColor && (
                    <div className="flex items-center gap-2">

                      <span className="text-sm text-gray-500">
                        Color
                      </span>

                      <span
                        className="flex items-center gap-2
                                   px-3 py-1 rounded-lg
                                   border border-gray-200
                                   text-sm font-medium"
                      >

                        <span
                          className="w-4 h-4 rounded-full
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

                {/* QUANTITY + DELETE */}
                <div className="flex items-center justify-between mt-5">

                  <div className="flex items-center
                                  border border-gray-300
                                  rounded-lg overflow-hidden">

                    <button
                      onClick={() =>
                        updateCart(index, item.qty - 1)
                      }
                      className="p-2 hover:bg-gray-100 transition"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="px-4 font-semibold">
                      {item.qty}
                    </span>

                    <button
                      onClick={() =>
                        updateCart(index, item.qty + 1)
                      }
                      className="p-2 hover:bg-gray-100 transition"
                    >
                      <Plus size={16} />
                    </button>

                  </div>

                  <button
                    onClick={() => removeItem(index)}
                    className="flex items-center gap-1
                               text-red-600 text-sm
                               hover:text-red-700 transition"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">
                      Remove
                    </span>
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

        {/* SUMMARY */}
        <div className="border border-gray-200 rounded-2xl p-6 h-fit xl:sticky xl:top-28">

          <h2 className="text-2xl font-bold mb-6">
            Order Summary
          </h2>

          <div className="flex justify-between mb-4 text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium text-black">
              Rs. {totalPrice.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between mb-5 text-gray-600">
            <span>Shipping</span>
            <span className="font-medium text-black">
              Rs. 0
            </span>
          </div>

          <div className="border-t border-gray-200 pt-5">

            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">
                Total
              </span>

              <span className="text-2xl font-bold">
                Rs. {totalPrice.toLocaleString()}
              </span>
            </div>

          </div>

          <button
            onClick={proceedToCheckout}
            className="mt-6 w-full bg-black text-white
                       py-3.5 rounded-xl font-semibold
                       hover:bg-gray-800 transition"
          >
            Proceed to Checkout
          </button>

        </div>

      </div>
      </div>
    </div>
  );
}