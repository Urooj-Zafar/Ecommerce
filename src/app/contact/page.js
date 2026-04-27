"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.success) {
      alert("Your message has been sent!");
      setFormData({ name: "", email: "", subject: "", message: "" });
      e.target.reset();
    } else {
      alert("Failed to send message: " + (data.message || "Unknown error"));
    }
  } catch (err) {
    console.error(err);
    alert("Network error. Please try again.");
  }
};

  return (
    <div className="bg-gray-100 text-black min-h-screen px-6 md:px-16 py-20 ">
      
      <div className="max-w-7xl mx-auto mb-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Contact Us
        </h1>
        <p className="text-black text-lg">
          Have a question about your order or our products? 
          Our support team is ready to assist you.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
        
        <div className="space-y-10">
          <div>
            <h2 className="text-xl font-semibold mb-3 uppercase tracking-widest text-black">
              Email
            </h2>
            <p className="text-xl font-medium">support@eliteshop.com</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 uppercase tracking-widest text-black">
              Phone
            </h2>
            <p className="text-xl font-medium">+92 300 1234567</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 uppercase tracking-widest text-black">
              Location
            </h2>
            <p className="text-xl font-medium">Pakistan</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="text-black bg-white shadow-xl space-y-8 border border-white/20 p-10 rounded-md bg-white"
        >
          <div>
            <h2 className="text-4xl font-semibold mb-4 text-center">Form</h2>
            <input
              type="text"
              name="name"
              required
              placeholder="Full Name"
              onChange={handleChange}
              className="w-full bg-transparent border-2 border-black p-2 py-3 rounded-md"
            />
          </div>

          <div>
            <input
              type="email"
              name="email"
              required
              placeholder="Email Address"
              onChange={handleChange}
              className="w-full bg-transparent border-2 border-black p-2 py-3 rounded-md"
            />
          </div>

          <div>
            <input
              type="text"
              name="subject"
              required
              placeholder="Subject"
              onChange={handleChange}
              className="w-full bg-transparent border-2 border-black p-2 py-3 rounded-md"
            />
          </div>

          <div>
            <textarea
              name="message"
              rows="4"
              required
              placeholder="Your Message"
              onChange={handleChange}
              className="w-full bg-transparent border-2 border-black p-2 py-3 rounded-md"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white rounded-md py-4 font-semibold tracking-wider hover:bg-gray-900 transition duration-300"
          >
            SEND MESSAGE
          </button>
        </form>
      </div>
    </div>
  );
}