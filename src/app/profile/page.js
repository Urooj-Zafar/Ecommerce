"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Star, X } from "lucide-react";

export default function Profile() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const [reviewingProduct, setReviewingProduct] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

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

  const cancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    setCancellingOrder(orderId);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: "cancelled",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to cancel order");
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? { ...order, status: "cancelled" }
            : order
        )
      );

      toast.success("Order cancelled", {
        icon: "✓",
        style: {
          background: "#000",
          color: "#fff",
        },
      });
    } catch (error) {
      console.error("CANCEL ORDER ERROR:", error);
      toast.error("Failed to cancel order");
    } finally {
      setCancellingOrder(null);
    }
  };

  const openReview = (item) => {
    const productId =
      typeof item.product === "object"
        ? item.product?._id
        : item.product;

    if (!productId) {
      toast.error("Product information not available");
      return;
    }

    setReviewingProduct({
      ...item,
      productId,
    });

    setSelectedRating(0);
    setHoverRating(0);
    setReviewComment("");
  };

  const closeReview = () => {
    if (submittingReview) return;

    setReviewingProduct(null);
    setSelectedRating(0);
    setHoverRating(0);
    setReviewComment("");
  };

  const submitReview = async () => {
    if (!reviewingProduct?.productId) {
      toast.error("Product information not available");
      return;
    }

    if (!selectedRating) {
      toast.error("Please select a rating");
      return;
    }

    setSubmittingReview(true);

    try {
      const res = await fetch(
        `/api/products/${reviewingProduct.productId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            rating: selectedRating,
            comment: reviewComment.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(
          data.message || "Failed to submit review"
        );
        return;
      }

      toast.success(
        data.message || "Review submitted successfully",
        {
          icon: "✓",
          style: {
            background: "#000",
            color: "#fff",
          },
        }
      );

      closeReview();
    } catch (error) {
      console.error("REVIEW ERROR:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const activeOrders = orders.filter(
    (order) =>
      order.status === "pending" ||
      order.status === "shipped"
  );

  const completedOrders = orders.filter(
    (order) => order.status === "delivered"
  );

  const cancelledOrders = orders.filter(
    (order) => order.status === "cancelled"
  );

  const getFilteredOrders = () => {
    if (activeTab === "active") return activeOrders;
    if (activeTab === "completed") return completedOrders;
    if (activeTab === "cancelled") return cancelledOrders;
    return orders;
  };

  const filteredOrders = getFilteredOrders();

  const OrderCard = ({ order }) => {
    const canCancel =
      order.status === "pending" ||
      order.status === "shipped";

    const isCompleted = order.status === "delivered";

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-sm">
              Order #{order._id.slice(-8)}
            </span>

            <span className="text-xs text-gray-500">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>

          <span
            className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${
              order.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : order.status === "shipped"
                ? "bg-blue-100 text-blue-700"
                : order.status === "delivered"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {order.status}
          </span>
        </div>

        <div className="p-4">
          {order.items?.map((item, index) => (
            <div
              key={`${order._id}-${index}`}
              className="flex gap-4 py-3 border-b last:border-b-0"
            >
              <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-600 mt-1">
                  Rs. {item.price} × {item.qty}
                </p>

                <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                  {item.size && (
                    <span>Size: {item.size}</span>
                  )}

                  {item.color && (
                    <span>Color: {item.color}</span>
                  )}
                </div>

                {isCompleted && (
                  <button
                    type="button"
                    onClick={() => openReview(item)}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-medium rounded-md hover:bg-gray-800 transition"
                  >
                    <Star size={14} />
                    Write Review
                  </button>
                )}
              </div>

              <div className="text-right">
                <p className="font-semibold text-sm">
                  Rs. {item.price * item.qty}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 border-t bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-gray-500">
            Payment:{" "}
            <span className="text-gray-800 font-medium">
              {order.paymentMethod}
            </span>
          </div>

          <div className="text-sm">
            Total:{" "}
            <span className="font-bold text-base">
              Rs. {order.total}
            </span>
          </div>

          {canCancel && (
            <button
              onClick={() => cancelOrder(order._id)}
              disabled={cancellingOrder === order._id}
              className="px-4 py-2 border border-black rounded-md text-sm hover:bg-black hover:text-white transition disabled:opacity-50"
            >
              {cancellingOrder === order._id
                ? "Cancelling..."
                : "Cancel Order"}
            </button>
          )}
        </div>

        <div className="px-4 py-3 bg-gray-50 border-t text-xs text-gray-500">
          <span className="font-medium text-gray-700">
            Deliver to:
          </span>{" "}
          {order.customer?.name},{" "}
          {order.customer?.address},{" "}
          {order.customer?.city}
        </div>
      </div>
    );
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-10 px-3 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5">
          <aside className="bg-white rounded-lg h-fit overflow-hidden">
            <div className="bg-black text-white p-6">
              <div className="flex items-center gap-4">
                {user.photo ? (
                  <img
                    src={user.photo}
                    alt={user.fullName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center text-2xl font-bold">
                    {user.fullName
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <h2 className="font-semibold truncate">
                    {user.fullName}
                  </h2>

                  <p className="text-xs text-gray-300 truncate">
                    @{user.userName}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`w-full text-left px-4 py-3 rounded-md text-sm ${
                  activeTab === "all"
                    ? "bg-gray-100 font-semibold"
                    : "hover:bg-gray-50"
                }`}
              >
                My Orders
              </button>

              <button
                onClick={() => setActiveTab("active")}
                className={`w-full flex justify-between px-4 py-3 rounded-md text-sm ${
                  activeTab === "active"
                    ? "bg-gray-100 font-semibold"
                    : "hover:bg-gray-50"
                }`}
              >
                <span>Active Orders</span>
                <span>{activeOrders.length}</span>
              </button>

              <button
                onClick={() => setActiveTab("completed")}
                className={`w-full flex justify-between px-4 py-3 rounded-md text-sm ${
                  activeTab === "completed"
                    ? "bg-gray-100 font-semibold"
                    : "hover:bg-gray-50"
                }`}
              >
                <span>Completed</span>
                <span>{completedOrders.length}</span>
              </button>

              <button
                onClick={() => setActiveTab("cancelled")}
                className={`w-full flex justify-between px-4 py-3 rounded-md text-sm ${
                  activeTab === "cancelled"
                    ? "bg-gray-100 font-semibold"
                    : "hover:bg-gray-50"
                }`}
              >
                <span>Cancelled</span>
                <span>{cancelledOrders.length}</span>
              </button>
            </div>

            <div className="border-t p-4">
              <p className="text-xs text-gray-500">
                Email
              </p>

              <p className="text-sm mt-1 break-all">
                {user.email}
              </p>
            </div>
          </aside>

          <main>
            <div className="bg-white rounded-lg border mb-5 overflow-x-auto">
              <div className="flex min-w-max">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === "all"
                      ? "border-black text-black"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  All Orders
                </button>

                <button
                  onClick={() => setActiveTab("active")}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === "active"
                      ? "border-black text-black"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  Active
                </button>

                <button
                  onClick={() => setActiveTab("completed")}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === "completed"
                      ? "border-black text-black"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  Completed
                </button>

                <button
                  onClick={() => setActiveTab("cancelled")}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === "cancelled"
                      ? "border-black text-black"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  Cancelled
                </button>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-lg border p-12 text-center">
                <p className="text-gray-500 text-sm">
                  No orders found.
                </p>

                <button
                  onClick={() => router.push("/products")}
                  className="mt-4 px-6 py-2 bg-black text-white rounded-md text-sm"
                >
                  Shop Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {reviewingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeReview}
          />

          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6">
            <button
              type="button"
              onClick={closeReview}
              disabled={submittingReview}
              className="absolute right-4 top-4 text-gray-500 hover:text-black disabled:opacity-40"
            >
              <X size={20} />
            </button>

            <div className="pr-8">
              <h2 className="text-xl font-semibold">
                Write a Review
              </h2>

              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {reviewingProduct.title}
              </p>
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium mb-3">
                Your Rating
              </p>

              <div className="flex gap-1">
                {Array.from({ length: 5 }).map(
                  (_, index) => {
                    const star = index + 1;

                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() =>
                          setHoverRating(star)
                        }
                        onMouseLeave={() =>
                          setHoverRating(0)
                        }
                        onClick={() =>
                          setSelectedRating(star)
                        }
                        disabled={submittingReview}
                        className="transition-transform hover:scale-110 disabled:opacity-50"
                      >
                        <Star
                          size={30}
                          className="text-yellow-400"
                          fill={
                            star <=
                            (hoverRating ||
                              selectedRating)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium mb-2">
                Your Review
              </label>

              <textarea
                value={reviewComment}
                onChange={(e) =>
                  setReviewComment(e.target.value)
                }
                disabled={submittingReview}
                placeholder="Share your experience with this product..."
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm outline-none resize-none focus:border-black disabled:bg-gray-100"
              />
            </div>

            <button
              type="button"
              onClick={submitReview}
              disabled={
                submittingReview || !selectedRating
              }
              className="w-full mt-5 py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40"
            >
              {submittingReview
                ? "Submitting..."
                : "Submit Review"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
