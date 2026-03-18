'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    userName: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.userName || !form.password) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      setLoading(true);

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        return;
      }

      if (data.success) {
        toast.success("Login successful");
         router.push("/login");
        // if (data.user?.role?.toLowerCase() === "admin") {
        //   router.push('/admin');
        // } else {
        //   router.push('/');
        // }

      } else {
        toast.error(data.message || "Invalid credentials");
      }

    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-5"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Login
        </h2>

        <input
          name="userName"
          value={form.userName}
          onChange={handleChange}
          placeholder="Username"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        />

        <div className="relative">
          <input
            type={view ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />

          <span
            onClick={() => setView(!view)}
            className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
          >
            {view ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition duration-300 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-center">
          Don’t have an account?{" "}
          <a href="/register" className="text-gray-600 underline">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}