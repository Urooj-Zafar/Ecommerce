"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    userName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !form.fullName ||
      !form.userName ||
      !form.email ||
      !form.password
    ) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.message || "Registration failed"
        );
        return;
      }

      toast.success("OTP sent to your email");

      router.push(
        `/verify-otp?email=${encodeURIComponent(
          form.email
        )}`
      );
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">

      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-5"
      >

        <h2 className="text-2xl font-bold text-center">
          Create Account
        </h2>

        <input
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full border rounded-lg px-4 py-2"
        />

        <input
          name="userName"
          value={form.userName}
          onChange={handleChange}
          placeholder="Username"
          className="w-full border rounded-lg px-4 py-2"
        />

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full border rounded-lg px-4 py-2"
        />

        <div className="relative">

          <input
            type={view ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full border rounded-lg px-4 py-2"
          />

          <span
            onClick={() => setView(!view)}
            className="absolute right-3 top-2.5 cursor-pointer"
          >
            {view ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </span>

        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg disabled:opacity-50"
        >
          {loading
            ? "Creating account..."
            : "Register"}
        </button>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <a
            href="/login"
            className="underline"
          >
            Login
          </a>
        </p>

      </form>
    </div>
  );
}