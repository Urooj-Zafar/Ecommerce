"use client";

import { useState, useEffect } from "react";
import { X, Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const savedCart =
      JSON.parse(localStorage.getItem("cart")) || [];

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
    localStorage.setItem(
      "cart",
      JSON.stringify(newCart)
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );
  };

  const removeItem = (index) => {
    const newCart = cart.filter(
      (_, i) => i !== index
    );

    setCart(newCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(newCart)
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );
  };

  const totalPrice = cart.reduce(
    (acc, item) =>
      acc +
      Number(item.price) *
        Number(item.qty),
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
        <p className="text-xl">
          Your cart is empty
        </p>
      </div>
    );
  }

  return (
    <div className="p-2 pt-30 min-h-screen">

      <h1 className="text-4xl font-bold mb-8 text-center">
        Your Cart
      </h1>

      <div className="grid grid-cols-1 md-grid-cols-2 xl:grid-cols-3 gap-5">

        {cart.map((item, index) => (

          <div
            key={item._id}
            className="flex gap-6 rounded-xl px-4"
          >

            <img
              src={item.images?.[0]}
              alt={item.title}
              className="w-32 h-32 object-cover rounded"
            />

            <div className="flex-1 flex flex-col justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  {item.title}
                </h2>

                <p className="text-gray-600">
                  Rs. {item.price}
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

              </div>

              <div className="flex items-center gap-4">

                <button
                  onClick={() =>
                    updateCart(
                      index,
                      item.qty - 1
                    )
                  }
                  className="px-2 py-1 border border-black rounded hover:bg-black hover:text-white transition"
                >
                  <Minus size={16} />
                </button>

                <span>
                  {item.qty}
                </span>

                <button
                  onClick={() =>
                    updateCart(
                      index,
                      item.qty + 1
                    )
                  }
                  className="px-2 py-1 border border-black rounded hover:bg-black hover:text-white transition"
                >
                  <Plus size={16} />
                </button>

                <button
                  onClick={() =>
                    removeItem(index)
                  }
                  className="ml-4 bg-red-600 text-black border border-red-600 rounded-sm p-1 "
                >
                  Delete
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

      <div className="mt-2  rounded-xl p-6  max-w-md">

        <h2 className="text-2xl font-bold mb-4">
          Summary
        </h2>

        <div className="flex justify-between mb-2">
          <span>Subtotal:</span>
          <span>Rs. {totalPrice}</span>
        </div>

        <div className="flex justify-between mb-2">
          <span>Shipping:</span>
          <span>Rs. 0</span>
        </div>

        <div className="flex justify-between font-bold text-lg border-t border-black pt-2">
          <span>Total:</span>
          <span>Rs. {totalPrice}</span>
        </div>

        <button
          onClick={proceedToCheckout}
          className="mt-6 w-full bg-black text-white py-3 rounded hover:bg-gray-900 transition"
        >
          Proceed to Checkout
        </button>

      </div>

    </div>
  );
}