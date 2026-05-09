"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function CategoryCarousel({ categories, handleCategoryClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 2;
  const slideWidth = 100 / visibleCount;
  const prev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? categories.length - visibleCount : prev - 1
    );
  };
  const next = () => {
    setCurrentIndex((prev) =>
      prev + visibleCount >= categories.length ? 0 : prev + 1
    );
  };

  return (
    <section className="py-12 max-w-7xl mx-auto relative group">
     

      <div className="overflow-hidden relative">
        {/* Categories Carousel */}
        <motion.div
          className="flex gap-6 select-none transition-transform duration-500"
          animate={{ x: `-${currentIndex * slideWidth}%` }}
        >
          {categories.map((cat) => (
            <motion.div
              key={cat._id}
              className="relative flex-shrink-0 w-1/2 h-70 sm:h-70 md:h-100 xl:h-100 cursor-pointer shadow-lg rounded-lg hover:rounded-[60%] transition-all duration-500"
              onClick={() => handleCategoryClick(cat)}
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-full h-full overflow-hidden rounded-lg transition-all duration-500 hover:rounded-[50%]">
    
              <img
                src={cat.images?.[0] || "/placeholder.png"}
                alt={cat.title}
                className="w-full h-full object-cover rounded-lg transition-all"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <h3 className="text-white font-bold text-lg">{cat.title}</h3>
              </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Left/Right Buttons (appear on hover) */}
        <button
          onClick={prev}
          className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/90 text-black p-4 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white transition z-20"
        >
          &#8592;
        </button>
        <button
          onClick={next}
          className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/90 text-black p-4 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white transition z-20"
        >
          &#8594;
        </button>
      </div>
    </section>
  );
}