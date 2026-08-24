"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

export default function FilteredProducts() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryFilter = searchParams.get("category");

  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [sortBy, setSortBy] = useState("default");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [hoveredIndex, setHoveredIndex] = useState({});
  const [mobileFilters, setMobileFilters] = useState(false);

  const [cart, setCart] = useState([]);

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
        setCurrentPage(1);
      } catch (error) {
        console.error(
          "FETCH PRODUCTS ERROR:",
          error.response?.data || error
        );

        toast.error("Failed to load products.");
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

  const belongsToCategory = (product) => {
    if (!categoryFilter) {
      return true;
    }

    const category = product?.category;

    if (
      typeof category === "object" &&
      category !== null
    ) {
      return (
        category?._id === categoryFilter ||
        category?.id === categoryFilter
      );
    }

    return category === categoryFilter;
  };

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    products = products.filter(belongsToCategory);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();

      products = products.filter((product) =>
        product?.title?.toLowerCase().includes(query)
      );
    }

    if (minPrice !== "") {
      products = products.filter(
        (product) =>
          Number(product?.price || 0) >= Number(minPrice)
      );
    }

    if (maxPrice !== "") {
      products = products.filter(
        (product) =>
          Number(product?.price || 0) <= Number(maxPrice)
      );
    }

    if (sortBy === "price-low") {
      products.sort(
        (a, b) =>
          Number(a?.price || 0) -
          Number(b?.price || 0)
      );
    }

    if (sortBy === "price-high") {
      products.sort(
        (a, b) =>
          Number(b?.price || 0) -
          Number(a?.price || 0)
      );
    }

    if (sortBy === "newest") {
      products.sort(
        (a, b) =>
          new Date(b?.createdAt || 0) -
          new Date(a?.createdAt || 0)
      );
    }

    return products;
  }, [
    allProducts,
    categoryFilter,
    searchQuery,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const totalPages = Math.ceil(
    filteredProducts.length / itemsPerPage
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const getDiscount = (product) => {
    if (product?.discount) {
      return Number(product.discount);
    }

    if (
      product?.originalPrice &&
      product?.price &&
      Number(product.originalPrice) >
        Number(product.price)
    ) {
      return Math.round(
        ((Number(product.originalPrice) -
          Number(product.price)) /
          Number(product.originalPrice)) *
          100
      );
    }

    return 0;
  };

  const addProductToCart = (product) => {
    if (Number(product?.stock || 0) < 1) {
      toast.error("Out of stock");
      return;
    }

    const existingIndex = cart.findIndex(
      (item) =>
        item?._id === product?._id &&
        !item?.selectedSize &&
        !item?.selectedColor
    );

    let newCart;

    if (existingIndex !== -1) {
      const existingQty = Number(
        cart[existingIndex]?.qty || 0
      );

      if (
        existingQty + 1 >
        Number(product?.stock || 0)
      ) {
        toast.error(
          "Cannot add more than available stock"
        );
        return;
      }

      newCart = [...cart];

      newCart[existingIndex] = {
        ...newCart[existingIndex],
        qty: existingQty + 1,
      };
    } else {
      newCart = [
        ...cart,
        {
          ...product,
          qty: 1,
          selectedSize: "",
          selectedColor: "",
        },
      ];
    }

    setCart(newCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(newCart)
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );

    toast.success("Added to cart");
  };

  const addToCart = (product) => {
    addProductToCart(product);
  };

  const resetFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSearchQuery("");
    setSortBy("default");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 pt-28">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="h-10 w-48 bg-gray-200 animate-pulse mb-6 rounded" />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="bg-white animate-pulse"
                >
                  <div className="aspect-square bg-gray-200" />

                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 w-2/3 bg-gray-200 rounded" />
                    <div className="h-5 w-1/2 bg-gray-200 rounded" />
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
    <div className="min-h-screen bg-gray-100 pt-28 pb-12">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-5">

        {/* SEARCH */}
        <div className="bg-white p-3 mb-4 shadow-sm">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearch}
              className="flex-1 border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition"
            />

            <button
              type="button"
              className="bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 transition"
            >
              Search
            </button>
          </div>
        </div>

        {/* MOBILE FILTER BUTTON */}
        <button
          type="button"
          onClick={() => setMobileFilters(true)}
          className="lg:hidden flex items-center justify-center gap-2 bg-white px-4 py-3 mb-4 w-full shadow-sm text-sm font-medium border border-gray-200"
        >
          <SlidersHorizontal size={18} />
          Filters & Sort
        </button>

        <div className="flex gap-5">

          {/* DESKTOP FILTERS */}
          <aside className="hidden lg:block w-[230px] shrink-0">
            <div className="bg-white p-4 sticky top-24 shadow-sm">

              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <h2 className="font-semibold text-gray-800">
                  Filters
                </h2>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-gray-500 hover:text-black"
                >
                  Reset
                </button>
              </div>

              <div className="py-5">
                <h3 className="font-medium text-sm mb-4">
                  Price
                </h3>

                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full border border-gray-300 px-2 py-2 text-xs outline-none focus:border-black"
                  />

                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full border border-gray-300 px-2 py-2 text-xs outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <h3 className="font-medium text-sm mb-3">
                  Quick Price
                </h3>

                <div className="space-y-2">

                  <button
                    type="button"
                    onClick={() => {
                      setMinPrice("");
                      setMaxPrice("1000");
                      setCurrentPage(1);
                    }}
                    className="block text-sm text-gray-600 hover:text-black"
                  >
                    Under Rs. 1,000
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMinPrice("1000");
                      setMaxPrice("5000");
                      setCurrentPage(1);
                    }}
                    className="block text-sm text-gray-600 hover:text-black"
                  >
                    Rs. 1,000 - 5,000
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMinPrice("5000");
                      setMaxPrice("10000");
                      setCurrentPage(1);
                    }}
                    className="block text-sm text-gray-600 hover:text-black"
                  >
                    Rs. 5,000 - 10,000
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMinPrice("10000");
                      setMaxPrice("");
                      setCurrentPage(1);
                    }}
                    className="block text-sm text-gray-600 hover:text-black"
                  >
                    Above Rs. 10,000
                  </button>

                </div>
              </div>
            </div>
          </aside>

          {/* PRODUCTS */}
          <main className="flex-1 min-w-0">

            <div className="bg-white px-4 py-3 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">

              <span className="text-sm text-gray-600">
                {filteredProducts.length} Products
              </span>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Sort By:
                </span>

                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:border-black"
                >
                  <option value="default">
                    Popular
                  </option>

                  <option value="newest">
                    Newest
                  </option>

                  <option value="price-low">
                    Price Low to High
                  </option>

                  <option value="price-high">
                    Price High to Low
                  </option>
                </select>
              </div>
            </div>

            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">

                {paginatedProducts.map(
                  (product, productIndex) => {

                    const images = Array.isArray(
                      product?.images
                    )
                      ? product.images
                      : [];

                    const imageIndex =
                      hoveredIndex[product?._id] || 0;

                    const imageSrc =
                      images[imageIndex] ||
                      images[0] ||
                      "/user.jpeg";

                    const discount =
                      getDiscount(product);

                    return (
                      <motion.div
                        key={product?._id}
                        initial={{
                          opacity: 0,
                          y: 15,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration: 0.25,
                          delay:
                            productIndex * 0.02,
                        }}
                        className="bg-white cursor-pointer group overflow-hidden border border-transparent hover:border-gray-300 hover:shadow-md transition"
                        onClick={() =>
                          router.push(
                            `/products/${product?._id}`
                          )
                        }
                      >

                        {/* IMAGE */}
                        <div
                          className="relative aspect-square bg-gray-50 overflow-hidden"
                          onMouseEnter={() => {
                            if (images.length > 1) {
                              setHoveredIndex(
                                (prev) => ({
                                  ...prev,
                                  [product?._id]: 1,
                                })
                              );
                            }
                          }}
                          onMouseLeave={() => {
                            setHoveredIndex(
                              (prev) => ({
                                ...prev,
                                [product?._id]: 0,
                              })
                            );
                          }}
                        >

                          <img
                            src={imageSrc}
                            alt={
                              product?.title ||
                              "Product"
                            }
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {discount > 0 && (
                            <div className="absolute top-2 left-2 bg-black text-white text-[10px] px-2 py-1 font-medium">
                              -{discount}%
                            </div>
                          )}

                          {Number(product?.stock || 0) < 1 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="bg-white text-black px-3 py-1 text-xs font-semibold">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </div>

                        {/* PRODUCT INFO */}
                        <div className="p-2">

                          <h2 className="text-[13px] leading-5 text-gray-800 line-clamp-2 min-h-[40px]">
                            {product?.title ||
                              "Untitled Product"}
                          </h2>

                          <div className="mt-2">
                            <span className="text-black text-lg font-semibold">
                              Rs.{" "}
                              {Number(
                                product?.price || 0
                              ).toLocaleString()}
                            </span>
                          </div>

                          <div className="text-[11px] text-gray-400 mt-1">
                            {Number(product?.stock || 0) > 0
                              ? `In Stock: ${product.stock}`
                              : "Out of Stock"}
                          </div>
                        </div>

                        {/* ADD TO CART */}
                        <button
                          type="button"
                          disabled={
                            Number(product?.stock || 0) < 1
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="w-[calc(100%-16px)] mx-2 py-2.5 mb-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Add to Cart
                        </button>

                      </motion.div>
                    );
                  }
                )}

              </div>
            ) : (
              <div className="bg-white py-20 text-center">

                <p className="text-gray-500">
                  No products found.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 text-black text-sm underline"
                >
                  Clear Filters
                </button>

              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">

                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.max(page - 1, 1)
                    )
                  }
                  className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 hover:bg-black hover:text-white disabled:opacity-40 transition"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({
                  length: totalPages,
                }).map((_, index) => {

                  const page = index + 1;

                  if (
                    totalPages > 7 &&
                    page > 3 &&
                    page < totalPages - 2
                  ) {
                    if (page === 4) {
                      return (
                        <span
                          key={page}
                          className="px-2 text-gray-500"
                        >
                          ...
                        </span>
                      );
                    }

                    return null;
                  }

                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() =>
                        setCurrentPage(page)
                      }
                      className={`w-10 h-10 text-sm border transition ${
                        currentPage === page
                          ? "bg-black text-white border-black"
                          : "bg-white border-gray-300 hover:bg-black hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={
                    currentPage === totalPages
                  }
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(
                        page + 1,
                        totalPages
                      )
                    )
                  }
                  className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 hover:bg-black hover:text-white disabled:opacity-40 transition"
                >
                  <ChevronRight size={18} />
                </button>

              </div>
            )}

          </main>
        </div>
      </div>

      {/* MOBILE FILTERS */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">

          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white p-5 overflow-y-auto">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-xl font-semibold">
                Filters
              </h2>

              <button
                type="button"
                onClick={() =>
                  setMobileFilters(false)
                }
              >
                <X />
              </button>

            </div>

            <div className="space-y-6">

              <div>

                <h3 className="font-medium mb-3">
                  Price
                </h3>

                <div className="flex gap-2">

                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full border border-gray-300 px-3 py-2"
                  />

                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full border border-gray-300 px-3 py-2"
                  />

                </div>
              </div>

              <div>

                <h3 className="font-medium mb-3">
                  Sort
                </h3>

                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full border border-gray-300 px-3 py-2"
                >
                  <option value="default">
                    Popular
                  </option>

                  <option value="newest">
                    Newest
                  </option>

                  <option value="price-low">
                    Price Low to High
                  </option>

                  <option value="price-high">
                    Price High to Low
                  </option>
                </select>

              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="w-full border border-black py-3"
              >
                Reset Filters
              </button>

              <button
                type="button"
                onClick={() =>
                  setMobileFilters(false)
                }
                className="w-full bg-black text-white py-3"
              >
                Apply
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}