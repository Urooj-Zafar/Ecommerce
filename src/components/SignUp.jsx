"use client";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function SignUp({ closeModal }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/users/register", {
        name,
        email,
        password,
      });

      if (res.data.status) {
        toast.success("Registered successfully!");
        closeModal();
      } else {
        setError(res.data.message || "Sign Up failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Sign Up failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white shadow-xl rounded-xl w-[90%] sm:w-[70%] md:w-[50%] xl:w-[35%] h-auto max-h-[90vh] p-6">
        <h1 className="text-xl font-bold mb-5 text-center">Sign Up</h1>

        {error && (
          <div className="bg-red-500 text-white p-2 mb-3 rounded text-center">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 my-2 rounded-md text-black border-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Email"
          className="w-full p-2 my-2 rounded-md text-black border-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 my-2 rounded-md text-black border-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-center gap-5 mt-5">
          <button onClick={closeModal} className="bg-gray-800 p-2 rounded-md">
            Cancel
          </button>
          <button
            onClick={handleSignUp}
            className="bg-orange-500 text-white p-2 rounded-md"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
