'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '',
    userName: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      toast.success('Registered successfully!');
      router.push('/login');
    } else {
      toast.error(data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-5"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Create Account
        </h2>

        <input
          name="fullName"
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        />

        <input
          name="userName"
          onChange={handleChange}
          placeholder="Username"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        />

        <div className="relative">
          <input
            type={view ? "text" : "password"}
            name="password"
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
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition duration-300"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        <p className="mt-4 text-sm">
          Already have an account? <a href="/login" className="text-gray-500 underline">Login</a></p>
      </form>
    </div>
  );
}