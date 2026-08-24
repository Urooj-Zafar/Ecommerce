"use client";

import React from "react";

export default function CategoryCarousel({
  categories,
  handleCategoryClick,
}) {
  return (
    <section className="py-5 max-w-7xl mx-auto">
      <div
        className="
          flex gap-6 overflow-x-auto overflow-y-hidden
          scroll-smooth
          select-none
          pb-4
          px-1
          scrollbar-thin
          scrollbar-thumb-black
          scrollbar-track-gray-200
        "
      >
        {categories?.map((cat) => (
          <div
            key={cat._id}
            className="
              relative
              flex-shrink-0
              w-[75%]
              sm:w-[45%]
              md:w-[32%]
              lg:w-[24%]
              h-50
              sm:h-60
              md:h-72
              xl:h-80
              cursor-pointer
              shadow-lg
              rounded-lg
              hover:rounded-[50%]
              transition-all
              duration-500
            "
            onClick={() => handleCategoryClick(cat)}
          >
            <div
              className="
                w-full
                h-full
                overflow-hidden
                rounded-lg
                hover:rounded-[50%]
                transition-all
                duration-500
              "
            >
              <img
                src={cat.images?.[0] || "/placeholder.png"}
                alt={cat.title || "Category"}
                className="
                  w-full
                  h-full
                  object-cover
                  rounded-lg
                  transition-transform
                  duration-500
                  hover:scale-105
                "
              />

              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <h3 className="text-white font-bold text-lg sm:text-xl text-center px-3">
                  {cat.title}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}