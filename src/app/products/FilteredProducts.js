"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function FilteredProducts() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryFilter = searchParams.get("category");

  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState({});

  const itemsPerPage = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const res = await axios.get("/api/products");

        const products = Array.isArray(res.data?.products)
          ? res.data.products
          : [];

        setAllProducts(products);

        if (categoryFilter) {
          const filtered = products.filter((product) => {
            const productCategory = product?.category;

            if (typeof productCategory === "object") {
              return productCategory?._id === categoryFilter;
            }

            return productCategory === categoryFilter;
          });

          setFilteredProducts(filtered);
        } else {
          setFilteredProducts(products);
        }

        setCurrentPage(1);
      } catch (error) {
        console.error(
          "FETCH PRODUCTS ERROR:",
          error.response?.data || error
        );

        setAllProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter]);

  useEffect(() => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      setCart(Array.isArray(savedCart) ? savedCart : []);
    } catch (error) {
      console.error("CART LOAD ERROR:", error);
      setCart([]);
    }
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();

    setSearchQuery(query);
    setCurrentPage(1);

    let products = [...allProducts];

    if (categoryFilter) {
      products = products.filter((product) => {
        const productCategory = product?.category;

        if (typeof productCategory === "object") {
          return productCategory?._id === categoryFilter;
        }

        return productCategory === categoryFilter;
      });
    }

    if (query) {
      products = products.filter((product) =>
        product?.title?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(products);
  };

  const addToCart = (product) => {
    const existing = cart.find(
      (item) => item._id === product._id
    );

    let newCart;

    if (existing) {
      newCart = cart.map((item) =>
        item._id === product._id
          ? {
              ...item,
              qty: (item.qty || 0) + 1,
            }
          : item
      );
    } else {
      newCart = [
        ...cart,
        {
          ...product,
          qty: 1,
        },
      ];
    }

    setCart(newCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(newCart)
    );

    window.dispatchEvent(new Event("cartUpdated"));
  };

  if (loading) {
    return (
      <p className="text-center mt-10 text-lg">
        Loading products...
      </p>
    );
  }

  const totalPages = Math.ceil(
    filteredProducts.length / itemsPerPage
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearch}
            className="border border-gray-300 px-4 py-3 rounded-full w-full max-w-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          />
        </div>

        {paginatedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
            {paginatedProducts.map((product) => {
              const images = Array.isArray(product?.images)
                ? product.images
                : [];

              const index =
                hoveredIndex[product._id] || 0;

              const imageSrc =
                images[index] ||
                images[0] ||
                "https://github.com/scriptwithahmad/u-shop-2.0/blob/main/public/user.jpeg?raw=true";

              return (
                <motion.div
                  key={product._id}
                  initial={{
                    opacity: 0,
                    y: 50,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 0.4,
                  }}
                  className="relative border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl hover:scale-105 transition"
                >
                  <div
                    className="relative w-full h-80 cursor-pointer"
                    onMouseEnter={() => {
                      if (images.length > 1) {
                        setHoveredIndex((prev) => ({
                          ...prev,
                          [product._id]: 1,
                        }));
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredIndex((prev) => ({
                        ...prev,
                        [product._id]: 0,
                      }));
                    }}
                  >
                    <AnimatePresence initial={false}>
                      <motion.img
                        key={imageSrc}
                        src={imageSrc}
                        alt={product?.title || "Product"}
                        className="w-full h-80 object-cover absolute top-0 left-0"
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        exit={{
                          opacity: 0,
                        }}
                        transition={{
                          duration: 0.4,
                        }}
                        onClick={() =>
                          router.push(
                            `/products/${product._id}`
                          )
                        }
                      />
                    </AnimatePresence>
                  </div>

                  <div className="p-4 flex flex-col gap-2">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {product?.title || "Untitled Product"}
                    </h2>

                    <p className="text-red-600 font-medium">
                      Price ${product?.price || 0}
                    </p>

                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="mt-2 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition font-medium"
                    >
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-center mt-10 text-lg">
            No products found.
          </p>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              type="button"
              onClick={() =>
                setCurrentPage((p) =>
                  Math.max(p - 1, 1)
                )
              }
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-400 rounded-full hover:bg-black hover:text-white transition disabled:opacity-50"
            >
              Prev
            </button>

            <span className="font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(p + 1, totalPages)
                )
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-400 rounded-full hover:bg-black hover:text-white transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}