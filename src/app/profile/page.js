"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Profile() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingOrder, setDeletingOrder] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem("user");
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    const getOrders = async () => {
      try {
        const res = await fetch("/api/orders/my-orders", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (res.status === 401) {
          toast.error("Please login");
          router.push("/");
          return;
        }

        if (!res.ok || !data.success) {
          toast.error(data.message || "Failed to load orders");
          return;
        }

        setOrders(data.orders || []);
      } catch (error) {
        console.error("ORDERS ERROR:", error);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }, [router]);

const deleteOrder = async (orderId) => {
  const confirmed = window.confirm(
    "Are you sure you want to cancel this order?"
  );

  if (!confirmed) return;

  setDeletingOrder(orderId);

  try {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      toast.error(data.message || "Failed to cancel order");
      return;
    }

    setOrders((prevOrders) =>
      prevOrders.filter((order) => order._id !== orderId)
    );

    toast.success("Order cancelled", {
      icon: "✓",
      style: {
        background: "#000",
        color: "#fff",
      },

    });
    router.refresh();
  } catch (error) {
    console.error("Error in cancelling order:", error);
    toast.error("Failed to cencel order");
  } finally {
    setDeletingOrder(null);
  }
};

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-30 p-2">
      <div className="max-w-5xl mx-auto">

        {/* PROFILE */}

        <div className="bg-white rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-5">
            {user.photo ? (
              <img
                src={user.photo}
                alt={user.fullName}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
                {user.fullName?.charAt(0)?.toUpperCase()}
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold">
                {user.fullName}
              </h1>

              <p className="text-gray-600">
                @{user.userName}
              </p>

              <p className="text-gray-500">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* ORDERS */}

        <div>
          <h2 className="text-2xl font-bold mb-5">
            My Orders
          </h2>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center">
              <p className="text-gray-500">
                You haven't placed any orders yet.
              </p>

              <button
                onClick={() => router.push("/products")}
                className="mt-4 bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                Shop Now
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white border rounded-2xl p-5"
                >

                  {/* ORDER HEADER */}

                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 border-b pb-4">

                    <div>
                      <p className="font-bold">
                        Order #{order._id}
                      </p>

                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : order.status === "shipped"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status}
                      </span>

                      <button
                        onClick={() => deleteOrder(order._id)}
                        disabled={deletingOrder === order._id}
                        className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingOrder === order._id
                          ? "Cancelling..."
                          : "Cencel"}
                      </button>

                    </div>
                  </div>

                  {/* PRODUCTS */}

                  <div className="py-5 space-y-4">
                    {order.items?.map((item, index) => (
                      <div
                        key={`${order._id}-${index}`}
                        className="flex gap-4"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                            No Image
                          </div>
                        )}

                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {item.title}
                          </h3>

                          <p className="text-gray-600">
                            Rs. {item.price} × {item.qty}
                          </p>

                          {item.size && (
                            <p className="text-sm text-gray-500">
                              Size: {item.size}
                            </p>
                          )}

                          {item.color && (
                            <p className="text-sm text-gray-500">
                              Color: {item.color}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ORDER FOOTER */}

                  <div className="border-t pt-4 flex flex-col md:flex-row md:justify-between gap-3">

                    <div>
                      <p className="text-sm text-gray-500">
                        Payment
                      </p>

                      <p className="font-medium">
                        {order.paymentMethod}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Payment Status
                      </p>

                      <p className="font-medium">
                        {order.paymentStatus}
                      </p>
                    </div>

                    <div className="md:text-right">
                      <p className="text-sm text-gray-500">
                        Total
                      </p>

                      <p className="text-xl font-bold">
                        Rs. {order.total}
                      </p>
                    </div>

                  </div>

                  {/* SHIPPING */}

                  <div className="border-t mt-4 pt-4">
                    <p className="font-semibold mb-2">
                      Shipping Information
                    </p>

                    <p>
                      {order.customer?.name}
                    </p>

                    <p className="text-gray-600">
                      {order.customer?.address}
                    </p>

                    <p className="text-gray-600">
                      {order.customer?.city}
                    </p>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}