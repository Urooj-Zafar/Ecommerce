"use client";
import CategoryCarousel from "@/components/CategoryCarousel";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const router = useRouter();

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
    router.push(`/products?category=${cat._id}`);
  };

  return (
    <div className="text-black overflow-x-hidden pt-30">

      {/* HERO */}
      <section className="relative h-[250px] sm:h-[400px] md:h-[550px] xl:h-[90vh] md:h-screen flex items-center justify-center text-white text-center overflow-hidden">
        
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute w-full h-full object-contain object-cover"
          src="/HomeVid.mp4"
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 px-4 sm:px-6 max-w-3xl">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-semibold leading-tight mb-4 md:mb-6">
            Redefine Your Everyday
          </h1>

          <p className="text-sm sm:text-lg md:text-xl text-gray-200 mb-6 md:mb-8">
            Elevated essentials designed for comfort, movement, and modern life.
          </p>

          <div className="flex justify-center gap-3 sm:gap-4 flex-wrap">
            <button  onClick={() => router.push("/products")} className="border border-white px-6 sm:px-8 py-2 sm:py-3 hover:bg-white hover:text-black transition">
              Shop Now
            </button>
          </div>
        </div>
      </section>
        <section className="bg-gray-50 ">
        <div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center pt-5">
            Explore Categories
          </h2>

          <CategoryCarousel
            categories={categories}
            handleCategoryClick={handleCategoryClick}
          />
        </div>
      </section>

      {/* SPLIT SECTION */}
      <section className="grid md:grid-cols-2 items-center">
        
        {/* Image */}
        <div
          className="h-[300px] sm:h-[400px] md:h-[550px] bg-cover bg-center"
          style={{ backgroundImage: "url('/WomenStyle.webp')" }}
        />

        {/* Content */}
        <div className="px-6 sm:px-10 md:px-20 py-10 md:py-16 text-center md:text-left">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold mb-4 md:mb-6 leading-tight">
            Made for Women Who Move
          </h2>

          <p className="text-gray-600 mb-6 md:mb-8 text-sm sm:text-lg">
            Designed to keep up with your lifestyle — effortless, minimal, and refined.
          </p>

          <button  onClick={() => router.push("/collections")} className="border border-black px-6 sm:px-8 py-2 sm:py-3 hover:bg-black hover:text-white transition">
            Discover Collection
          </button>
        </div>
      </section>

      {/* PARALLAX */}
     <section
  className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] bg-fixed bg-cover bg-center flex items-center justify-center text-white"
  style={{ backgroundImage: "url('/Paralex.avif')" }}
>

  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-black/50" />

  {/* Content */}
  <div className="relative z-10 text-center px-4 sm:px-6">
    <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold mb-4 md:mb-6">
      Confidence in Every Step
    </h2>

    <button onClick={() => router.push("/products")} className="border border-white px-6 sm:px-8 py-2 sm:py-3 hover:bg-white hover:text-black transition">
      Explore Now
    </button>
  </div>
</section>

    </div>
  );
}