"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  ShoppingBag,
  Package,
  Users,
  Clock3,
  Truck,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { FaRupeeSign } from "react-icons/fa6";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/admin/stats", {
          withCredentials: true,
        });

        setStats(res.data.stats || {});
        setOrders(res.data.recentOrders || []);
        setUsers(res.data.recentUsers || []);
      } catch (err) {
        console.log("ADMIN ERROR:", err.response?.status);
        console.log("ADMIN ERROR DATA:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const shippedOrders = orders.filter(
    (order) => order.status === "shipped"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "cancelled"
  ).length;

  const statusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700";
      case "shipped":
        return "bg-blue-50 text-blue-700";
      case "delivered":
        return "bg-green-50 text-green-700";
      case "cancelled":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="max-w-[1500px] mx-auto flex">


        <main className="flex-1 p-4 md:p-6 lg:p-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">

            <div>
              <p className="text-sm text-gray-500">
                Welcome back
              </p>

              <h1 className="text-2xl md:text-3xl font-bold mt-1">
                Admin Dashboard
              </h1>
            </div>

            <button
              onClick={() => router.push("/admin/orders")}
              className="flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition"
            >
              Manage Orders
              <ArrowRight size={16} />
            </button>

          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-5 mb-6">

            <DashboardCard
              title="Revenue"
              value={`Rs. ${(stats.revenue || 0).toLocaleString()}`}
              icon={<FaRupeeSign size={21} />}
            />

            <DashboardCard
              title="Total Orders"
              value={stats.orders || 0}
              icon={<ShoppingBag size={21} />}
            />

            <DashboardCard
              title="Products"
              value={stats.products || 0}
              icon={<Package size={21} />}
            />

            <DashboardCard
              title="Customers"
              value={stats.users || 0}
              icon={<Users size={21} />}
            />

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">

            <StatusCard
              title="Pending"
              value={pendingOrders}
              icon={<Clock3 size={18} />}
            />

            <StatusCard
              title="Shipped"
              value={shippedOrders}
              icon={<Truck size={18} />}
            />

            <StatusCard
              title="Delivered"
              value={deliveredOrders}
              icon={<CheckCircle2 size={18} />}
            />

            <StatusCard
              title="Cancelled"
              value={cancelledOrders}
              icon={<XCircle size={18} />}
            />

          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            <section className="xl:col-span-2">

              <div className="flex items-center justify-between mb-3">

                <div>
                  <h2 className="text-lg font-bold">
                    Recent Orders
                  </h2>

                  <p className="text-xs text-gray-500 mt-1">
                    Latest customer orders
                  </p>
                </div>

                <button
                  onClick={() => router.push("/admin/orders")}
                  className="text-sm font-medium hover:underline"
                >
                  View All
                </button>

              </div>

              <div className="bg-white border rounded-xl overflow-hidden">

                <div className="overflow-x-auto">

                  <table className="w-full text-sm">

                    <thead className="bg-black text-white">

                      <tr>
                        <th className="p-3 text-left">
                          Order
                        </th>

                        <th className="p-3 text-left">
                          Customer
                        </th>

                        <th className="p-3 text-left">
                          Amount
                        </th>

                        <th className="p-3 text-left">
                          Status
                        </th>

                        <th className="p-3 text-left">
                          Date
                        </th>
                      </tr>

                    </thead>

                    <tbody>

                      {orders.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="p-8 text-center text-gray-500"
                          >
                            No orders found
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr
                            key={order._id}
                            className="border-b last:border-b-0 hover:bg-gray-50"
                          >

                            <td className="p-3 font-medium">
                              #{order._id?.slice(-6)}
                            </td>

                            <td className="p-3">
                              <p className="font-medium">
                                {order.customer?.name}
                              </p>

                              <p className="text-xs text-gray-500">
                                {order.customer?.email}
                              </p>
                            </td>

                            <td className="p-3 font-semibold">
                              Rs.{" "}
                              {(order.total || 0).toLocaleString()}
                            </td>

                            <td className="p-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusStyle(
                                  order.status
                                )}`}
                              >
                                {order.status}
                              </span>
                            </td>

                            <td className="p-3 text-xs text-gray-500">
                              {new Date(
                                order.createdAt
                              ).toLocaleDateString()}
                            </td>

                          </tr>
                        ))
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </section>

            <section>

              <div className="flex items-center justify-between mb-3">

                <div>
                  <h2 className="text-lg font-bold">
                    New Customers
                  </h2>

                  <p className="text-xs text-gray-500 mt-1">
                    Recently registered users
                  </p>
                </div>

                <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                  {users.length}
                </span>

              </div>

              <div className="bg-white border rounded-xl overflow-hidden">

                {users.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No users found
                  </div>
                ) : (
                  users.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-3 p-4 border-b last:border-b-0"
                    >

                      {user.photo ? (
                        <img
                          src={user.photo}
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                          {user.fullName
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">

                        <p className="font-medium text-sm truncate">
                          {user.fullName}
                        </p>

                        <p className="text-xs text-gray-500 truncate">
                          @{user.userName}
                        </p>

                      </div>

                      <span className="text-xs text-gray-400">
                        {new Date(
                          user.createdAt
                        ).toLocaleDateString()}
                      </span>

                    </div>
                  ))
                )}

              </div>

            </section>

          </div>

        </main>

      </div>

    </div>
  );
}

function DashboardCard({ title, value, icon }) {
  return (
    <div className="bg-white border rounded-xl p-4 md:p-5">

      <div className="flex items-center justify-between mb-4">

        <p className="text-xs md:text-sm text-gray-500">
          {title}
        </p>

        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
          {icon}
        </div>

      </div>

      <h2 className="text-xl md:text-2xl font-bold">
        {value}
      </h2>

    </div>
  );
}

function StatusCard({ title, value, icon }) {
  return (
    <div className="bg-white border rounded-xl p-4 flex items-center gap-3">

      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
        {icon}
      </div>

      <div>
        <p className="text-xs text-gray-500">
          {title}
        </p>

        <p className="text-lg font-bold">
          {value}
        </p>
      </div>

    </div>
  );
}
