"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Safe fetch users
  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/users", { withCredentials: true });
      setUsers(res.data.users || []);
    } catch (err) {
      console.log(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id) => {
  if (!confirm("Delete this user?")) return;

  try {
    const res = await axios.delete(`/api/users/${id}`, { withCredentials: true });
    console.log(res.data);

    if (res.data.success) {
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } else {
      alert(res.data.message);
    }
  } catch (err) {
    alert(err.response?.data?.message || "Error deleting user");
  }
};

  if (loading) return <p className="p-10 text-center">Loading users...</p>;

  return (
    <div className="p-2 md:p-6">
      <h1 className="text-2xl md:text-4xl font-bold mb-6 text-center">
        Users
      </h1>
<div className="border border-black rounded-xl overflow-x-auto">
  <table className="w-full table-auto text-sm md:text-base border-collapse w-[500px]">
    
    <thead className="bg-black text-white">
      <tr>
        <th className="p-2 md:p-3 text-left">Name</th>
        <th className="p-2 md:p-3 text-left">Username</th>
        <th className="p-2 md:p-3 text-left">Role</th>
        <th className="p-2 md:p-3 text-left">Joined</th>
        <th className="p-2 md:p-3 text-left">Action</th>
      </tr>
    </thead>

    <tbody>
      {users.length === 0 ? (
        <tr>
          <td colSpan="5" className="p-4 md:p-6 text-center">
            No users
          </td>
        </tr>
      ) : (
        users.map((u) => (
          <tr key={u._id} className="border-b hover:bg-gray-50">
            
            <td className="p-2 md:p-3 font-medium">
              {u.fullName}
            </td>

            <td className="p-2 md:p-3 text-xs md:text-sm">
              @{u.userName}
            </td>

            <td className="p-2 md:p-3">
              {u.role === "admin" ? (
                <span className="px-2 py-1 text-xs bg-black text-white rounded-full">
                  Admin
                </span>
              ) : (
                <span className="px-2 py-1 text-xs border border-black rounded-full">
                  User
                </span>
              )}
            </td>

            <td className="p-2 md:p-3 text-xs md:text-sm">
              {typeof window !== "undefined" &&
                new Date(u.createdAt).toLocaleDateString()}
            </td>

            <td className="p-2 md:p-3">
              <button
                onClick={() => deleteUser(u._id)}
                className="border p-2 rounded hover:bg-black hover:text-white transition"
              >
                <Trash2 size={14} />
              </button>
            </td>

          </tr>
        ))
      )}
    </tbody>

  </table>
</div>
    </div>
  );
}