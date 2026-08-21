"use client";

import Link from "next/link";

export default function Footer() {
  const handleSubmit = async (e) => {
  e.preventDefault();

  const email = e.target.email.value.trim();
  if (!email) return alert("Enter email");

  try {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Subscribed!");
      e.target.reset();
    } else {
      alert(data.message || "Error subscribing");
    }
  } catch (err) {
    console.error(err);
    alert("Network error");
  }
};
  return (
    <footer className="bg-black text-white">

      {/* Newsletter Hero */}
      <div className="text-center p-5 md:px-16 border-b border-white/10">

        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
          Don't Miss Out!
        </h2>

        <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
          Be the first to hear about our hot drops, secret sales & more.
          Join the EliteShop now!
        </p>


      </div>

      {/* Bottom minimal bar */}
      <div className="max-w-7xl mx-auto p-2 text-center text-xs text-gray-500">

        <p>
          © {new Date().getFullYear()} EliteShop
        </p>

      </div>

    </footer>
  );
}