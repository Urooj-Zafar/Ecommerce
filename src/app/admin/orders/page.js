"use client"
import toast from "react-hot-toast";
import { useEffect, useState } from "react"
import axios from "axios"
import {Trash2Icon } from "lucide-react";
import React from "react"
export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [openRow, setOpenRow] = useState(null)

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/api/orders")
      setOrders(res.data.orders || [])
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const statusStyle = (status) => {
    switch (status) {
      case "pending":
        return "border-black text-black"
      case "shipped":
        return "bg-black text-white"
      case "delivered":
        return "bg-gray-800 text-white"
      case "cancelled":
        return "border border-gray-400 text-gray-500"
      default:
        return "border-black"
    }
  }
const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure to delete this order?"
  );

  if (!confirmDelete) return;

  try {
    const res = await axios.delete(`/api/orders/${id}`);

    if (res.data.success) {
  setOrders((prevOrders) =>
    prevOrders.filter((order) => order._id !== id)
  );

  toast.success("Order deleted successfully");
} else {
      toast.error(res.data.message || "Deletion failed");
    }
  } catch (error) {
    console.error("DELETE ORDER ERROR:", error);
    toast.error(
      error.response?.data?.message || "Delete failed"
    );
  }
};
  if (loading) return <p className="p-10 text-center">Loading orders...</p>

  return (
    <div className="p-2 md:p-6">
      <h1 className="text-4xl md:text-4xl font-bold mb-6 text-center">Orders</h1>

      <div className="border border-black rounded-xl overflow-x-auto">
        <table className="w-full table-auto text-xs sm:text-sm md:text-base border-collapse">
          <thead className="bg-black text-white">
            <tr>
              <th className="p-2 md:p-3 text-left">ID</th>
              <th className="p-2 md:p-3 text-left">Customer</th>
              <th className="hidden md:table-cell p-2 md:p-3 text-left">Items</th>
              <th className="hidden md:table-cell p-2 md:p-3 text-left">Total</th>
              <th className="hidden lg:table-cell p-2 md:p-3 text-left">Payment</th>
              <th className="hidden lg:table-cell p-2 md:p-3 text-left">Status</th>
              <th className="hidden lg:table-cell p-2 md:p-3 text-left">Date</th>
              <th className="p-2 md:p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center">No orders</td>
              </tr>
            ) : (
              orders.map((order) => (
                <React.Fragment key={order._id}>
                  {/* MAIN ROW */}
                  <tr
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      setOpenRow(openRow === order._id ? null : order._id)
                    }
                  >
                    <td className="p-2 md:p-3 font-medium">#{order._id.slice(-6)}</td>
                    <td className="p-2 md:p-3">
                      <p className="font-medium">{order.customer?.name}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">
                        {order.customer?.email}
                      </p>
                    </td>
                    <td className="hidden md:table-cell p-2 md:p-3">{order.items?.length}</td>
                    <td className="hidden md:table-cell p-2 md:p-3 font-semibold">${order.total}</td>
                    <td className="hidden lg:table-cell p-2 md:p-3">
                      {order.paymentStatus === "paid" ? (
                        <span className="px-2 py-1 text-xs bg-black text-white rounded-full">Paid</span>
                      ) : (
                        <span className="px-2 py-1 text-xs border border-black rounded-full">Unpaid</span>
                      )}
                    </td>
                    <td className="hidden lg:table-cell p-2 md:p-3">
                      <span className={`px-2 py-1 text-xs rounded-full border ${statusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell p-2 md:p-3 text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2 md:p-3">
                      <button
                    onClick={() => handleDelete(order._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2Icon size={18} />
                  </button>
                    </td>
                  </tr>

                  {/* EXPANDABLE ROW ONLY FOR MD & SM */}
                  {openRow === order._id && (
                    <tr className="md:hidden bg-gray-50">
                      <td colSpan={3} className="p-3 text-xs space-y-2">
                        <div className="flex justify-between">
                          <span>Items:</span>
                          <span>{order.items?.length}</span>
                        </div>

                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span className="font-semibold">${order.total}</span>
                        </div>

                        <div className="flex justify-between">
                          <span>Payment:</span>
                          {order.paymentStatus === "paid" ? (
                            <span className="px-2 py-1 text-xs bg-black text-white rounded-full">Paid</span>
                          ) : (
                            <span className="px-2 py-1 text-xs border border-black rounded-full">Unpaid</span>
                          )}
                        </div>

                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className={`px-2 py-1 text-xs rounded-full border ${statusStyle(order.status)}`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}