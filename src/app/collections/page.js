"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Collection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);

        const res = await axios.get("/api/category");

        const data = Array.isArray(res.data?.Category)
          ? res.data.Category
          : [];

        setCategories(data);
      } catch (error) {
        console.error(
          "FETCH CATEGORIES ERROR:",
          error.response?.data || error
        );

        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);


  const handleCategoryClick = (category) => {
    router.push(
      `/FilteredProducts?category=${category._id}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4">

          <div className="h-8 w-40 bg-gray-200 animate-pulse mb-8" />

          <div className="
            grid
            grid-cols-2
            sm:grid-cols-3
            md:grid-cols-4
            lg:grid-cols-6
            gap-3
          ">
            {Array.from({ length: 12 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="
                    bg-white
                    animate-pulse
                  "
                >
                  <div className="
                    aspect-square
                    bg-gray-200
                  " />

                  <div className="p-3">
                    <div className="
                      h-4
                      bg-gray-200
                      w-3/4
                    " />
                  </div>
                </div>
              )
            )}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="
      min-h-screen
      bg-gray-100
      pt-28
      pb-14
    ">

      <div className="
        max-w-7xl
        mx-auto
        px-3
        sm:px-5
      ">

        <div className="
          bg-white
          px-5
          py-5
          mb-4
          border-b
          border-gray-200
        ">

          <h1 className="
            text-2xl
            md:text-3xl
            font-semibold
            text-gray-900
          ">
            Collections
          </h1>

          <p className="
            text-sm
            text-gray-500
            mt-1
          ">
            Explore our categories
          </p>

        </div>

      
        {categories.length > 0 && (
          <div className="
            bg-white
            mb-4
            overflow-x-auto
            border-b
            border-gray-200
          ">

            <div className="
              flex
              min-w-max
            ">

              {categories.map((category) => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() =>
                    handleCategoryClick(category)
                  }
                  className="
                    px-5
                    py-4
                    text-sm
                    text-gray-700
                    border-r
                    border-gray-100
                    hover:bg-black
                    hover:text-white
                    transition
                    whitespace-nowrap
                  "
                >
                  {category.title}
                </button>
              ))}

            </div>
          </div>
        )}

      
        {categories.length > 0 ? (
          <div className="
            grid
            grid-cols-2
            sm:grid-cols-3
            md:grid-cols-4
            lg:grid-cols-6
            gap-3
          ">

            {categories.map(
              (category, index) => {

                const images = Array.isArray(
                  category?.images
                )
                  ? category.images
                  : [];

                const firstImage =
                  images[0];

                const secondImage =
                  images[1];

                const isHovered =
                  hovered === category._id;

                const imageSrc =
                  isHovered &&
                  secondImage
                    ? secondImage
                    : firstImage;

                return (
                  <motion.div
                    key={category._id}
                    initial={{
                      opacity: 0,
                      y: 25,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 0.35,
                      delay:
                        index * 0.04,
                    }}
                    onMouseEnter={() =>
                      setHovered(
                        category._id
                      )
                    }
                    onMouseLeave={() =>
                      setHovered(null)
                    }
                    onClick={() =>
                      handleCategoryClick(
                        category
                      )
                    }
                    className="
                      group
                      bg-white
                      cursor-pointer
                      overflow-hidden
                      border
                      border-transparent
                      hover:border-gray-300
                      hover:shadow-md
                      transition
                    "
                  >

                    <div className="
                      relative
                      aspect-square
                      bg-gray-50
                      overflow-hidden
                    ">

                      {imageSrc ? (
                        <motion.img
                          key={imageSrc}
                          src={imageSrc}
                          alt={
                            category.title ||
                            "Category"
                          }
                          initial={{
                            opacity: 0.7,
                          }}
                          animate={{
                            opacity: 1,
                          }}
                          transition={{
                            duration: 0.25,
                          }}
                          className="
                            w-full
                            h-full
                            object-cover
                            group-hover:scale-105
                            transition-transform
                            duration-300
                          "
                        />
                      ) : (
                        <div className="
                          w-full
                          h-full
                          flex
                          items-center
                          justify-center
                          bg-gray-100
                          text-gray-400
                          text-sm
                        ">
                          No Image
                        </div>
                      )}

                      {/* BLACK HOVER OVERLAY */}

                      <div className="
                        absolute
                        inset-0
                        bg-black/0
                        group-hover:bg-black/10
                        transition
                      " />

                    </div>

                    <div className="
                      p-3
                      text-center
                    ">

                      <h2 className="
                        text-sm
                        md:text-[15px]
                        font-medium
                        text-gray-800
                        line-clamp-2
                      ">
                        {category.title}
                      </h2>

                      <p className="
                        text-xs
                        text-gray-400
                        mt-1
                        group-hover:text-black
                        transition
                      ">
                        Shop Now →
                      </p>

                    </div>

                  </motion.div>
                );
              }
            )}

          </div>
        ) : (
          <div className="
            bg-white
            py-20
            text-center
          ">

            <h2 className="
              text-xl
              font-medium
              text-gray-800
            ">
              No collections found
            </h2>

            <p className="
              text-sm
              text-gray-500
              mt-2
            ">
              There are no categories available.
            </p>

          </div>
        )}

      </div>
    </div>
  );
}