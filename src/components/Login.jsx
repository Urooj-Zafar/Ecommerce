"use client";

import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Login({ onClose }) {
  const router = useRouter();

  const [form, setForm] = useState({
    userName: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.userName || !form.password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        return;
      }

      if (!data.success) {
        toast.error(data.message || "Invalid credentials");
        return;
      }

      // Save user for navbar
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // Tell navbar that user logged in
      window.dispatchEvent(
        new Event("userUpdated")
      );

      toast.success("Login successful");

      // Close modal
      onClose();

      // Only admin goes to admin dashboard
      if (
        data.user?.role?.toLowerCase() === "admin"
      ) {
        router.push("/admin");
      }

    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
        onMouseDown={(e) => e.stopPropagation()}
      >

        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-black transition"
        >
          <X size={22} />
        </button>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          <h2 className="text-2xl font-bold text-center">
            Login
          </h2>

          {/* USERNAME */}
          <input
            type="text"
            name="userName"
            value={form.userName}
            onChange={handleChange}
            placeholder="Username"
            autoComplete="username"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={view ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-black"
            />

            <button
              type="button"
              onClick={() => setView((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
            >
              {view ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          {/* LOGIN */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-sm text-center">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push("/register");
              }}
              className="text-gray-600 underline"
            >
              Register
            </button>
          </p>

        </form>
      </div>
    </div>
  );
}