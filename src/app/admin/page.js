"use client";

import { useEffect, useState } from "react";
import axios from "axios";
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
        const res = await axios.get("/api/admin/stats", { withCredentials: true });
        setStats(res.data.stats || {});
        setOrders(res.data.recentOrders || []);
        setUsers(res.data.recentUsers || []);
      } catch (err) {
        if (err.response?.status === 403) router.push("/");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 overflow-x-hidden">
      
      {/* MAIN CONTENT */}
      <div className="flex-1 p-4 md:p-6 lg:p-10 overflow-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
            Admin Dashboard
          </h1>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold w-fit">
            Role: Admin
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard title="Revenue" value={`$${stats?.revenue?.toLocaleString() || 0}`} color="text-green-600" />
          <StatCard title="Orders" value={stats?.orders || 0} color="text-blue-600" />
          <StatCard title="Products" value={stats?.products || 0} color="text-purple-600" />
          <StatCard title="Users" value={stats?.users || 0} color="text-orange-600" />
        </div>

        {/* ORDERS */}
        <Section title="Recent Orders" count={orders.length} color="blue">
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm md:text-base border-collapse">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-2 md:p-3 text-left">ID</th>
                  <th className="p-2 md:p-3 text-left">Customer</th>
                  <th className="p-2 md:p-3 text-left">Total</th>
                  <th className="p-2 md:p-3 text-left">Status</th>
                  <th className="p-2 md:p-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-4 md:p-6 text-center">
                      No orders
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o._id} className="border-b hover:bg-gray-50">
                      <td className="p-2 md:p-3 font-mono text-xs md:text-sm">
                        #{o._id?.slice(-6)}
                      </td>
                      <td className="p-2 md:p-3">{o.customer?.name}</td>
                      <td className="p-2 md:p-3 font-semibold">${o.total?.toLocaleString()}</td>
                      <td className="p-2 md:p-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            o.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : o.status === "shipped"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="p-2 md:p-3 text-xs md:text-sm">
                        {typeof window !== "undefined" &&
                          new Date(o.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Section>

        {/* USERS */}
        <Section title="New Users" count={users.length} color="purple">
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm md:text-base border-collapse">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-2 md:p-3 text-left">Name</th>
                  <th className="p-2 md:p-3 text-left">Username</th>
                  <th className="p-2 md:p-3 text-left">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-4 md:p-6 text-center">
                      No users
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="border-b hover:bg-gray-50">
                      <td className="p-2 md:p-3">{u.fullName}</td>
                      <td className="p-2 md:p-3 text-xs md:text-sm">@{u.userName}</td>
                      <td className="p-2 md:p-3 text-xs md:text-sm">
                        {typeof window !== "undefined" &&
                          new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Section>

      </div>
    </div>
  );
}

/* COMPONENTS */
function StatCard({ title, value, color }) {
  return (
    <div className="bg-white p-4 md:p-5 rounded-xl shadow hover:shadow-md transition w-full">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className={`text-xl md:text-2xl lg:text-3xl font-bold ${color}`}>{value}</h2>
    </div>
  );
}

function Section({ title, count, children, color }) {
  return (
    <div className="mb-6 md:mb-8">
      <h2 className="text-lg md:text-xl font-bold mb-2 flex items-center">
        {title}
        <span
          className={`ml-2 text-xs md:text-sm px-2 py-1 rounded-full bg-${color}-100 text-${color}-700`}
        >
          {count}
        </span>
      </h2>
      <div className="bg-white border rounded-xl shadow overflow-auto">{children}</div>
    </div>
  );
}