"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Collection() {
  const [categories, setCategories] = useState([]);
  const [hovered, setHovered] = useState(null);
  const router = useRouter();

  // fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/category");
        setCategories(res.data.Category || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (cat) => {
    router.push(`/FilteredProducts?category=${cat._id}`);
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-8 text-center">Collections</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat, i) => (
          <motion.div
  key={cat._id}
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5, delay: i * 0.1 }}
  onMouseEnter={() => setHovered(cat._id)}
  onMouseLeave={() => setHovered(null)}
  onClick={() => handleCategoryClick(cat)}
  className="relative cursor-pointer overflow-hidden shadow-lg h-72" // fixed card height
>
  {/* Category Image */}
  {cat.images?.[0] ? (
    <motion.img
      src={cat.images[0]}
      alt={cat.title}
      initial={{ borderRadius: "50%" }}
      animate={{ borderRadius: hovered === cat._id ? "0%" : "50%" }}
      className="w-full h-full object-cover transition-all duration-500"
    />
  ) : (
    <motion.div
      className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500"
      initial={{ borderRadius: "50%" }}
      animate={{ borderRadius: hovered === cat._id ? "0%" : "50%" }}
    >
      No Image
    </motion.div>
  )}

  {/* Title Overlay */}
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/60 text-white px-2 py-1 font-bold text-xl rounded text-center">
    {cat.title}
  </div>
</motion.div>
        ))}
      </div>
    </div>
  );
}