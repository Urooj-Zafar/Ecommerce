"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; 

export default function Model({ closeModal, openSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      const res = await axios.post("http://localhost:3000/users/login", { email, password });
      if (res.data.status) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        router.push("/")
        closeModal();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white shadow-xl rounded-xl w-[90%] sm:w-[70%] md:w-[50%] xl:w-[35%] h-auto max-h-[90vh] p-6">
        <h1 className="text-xl font-bold mb-5 text-center">Sign In</h1>

        {error && <div className="bg-red-500 text-white p-2 mb-3 rounded text-center">{error}</div>}

        <label>Email</label>
        <input
          type="text"
          placeholder="abc@gmail.com"
          className="w-full p-2 my-2 rounded-md text-black border-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="abc123"
          className="w-full p-2 my-2 rounded-md text-black border-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <p className="mt-2">
          New user?{" "}
          <span className="text-blue-500 cursor-pointer" onClick={openSignUp}>
            Sign Up
          </span>
        </p>

        <div className="flex justify-center gap-5 mt-5">
          <button onClick={closeModal} className="bg-gray-800 p-2 rounded-md">
            Cancel
          </button>
          <button onClick={handleSignIn} className="bg-orange-500 text-white p-2 rounded-md">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
