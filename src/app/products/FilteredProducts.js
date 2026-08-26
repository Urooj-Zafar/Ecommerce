"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Star,
} from "lucide-react";

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

  const [selectedRating, setSelectedRating] = useState(0);

  const [hoveredIndex, setHoveredIndex] = useState({});

  const [mobileFilters, setMobileFilters] = useState(false);

  const [cart, setCart] = useState([]);

  const itemsPerPage = 12;

  // =========================
  // FETCH PRODUCTS
  // =========================
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

        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // =========================
  // LOAD CART
  // =========================
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

  // =========================
  // CATEGORY HELPER
  // =========================
  const belongsToCategory = (product) => {
    if (!categoryFilter) return true;

    const category = product?.category;

    if (typeof category === "object" && category !== null) {
      return (
        category?._id === categoryFilter ||
        category?.id === categoryFilter
      );
    }

    return category === categoryFilter;
  };

  // =========================
  // FILTER + SORT
  // =========================
  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    // Category
    products = products.filter(belongsToCategory);

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();

      products = products.filter((product) =>
        product?.title?.toLowerCase().includes(query)
      );
    }

    // Minimum price
    if (minPrice !== "") {
      products = products.filter(
        (product) => Number(product?.price || 0) >= Number(minPrice)
      );
    }

    // Maximum price
    if (maxPrice !== "") {
      products = products.filter(
        (product) => Number(product?.price || 0) <= Number(maxPrice)
      );
    }

    // Rating
    if (selectedRating > 0) {
      products = products.filter((product) => {
        const rating = Number(
          product?.rating ||
            product?.ratings ||
            product?.averageRating ||
            0
        );

        return rating >= selectedRating;
      });
    }

    // Sorting
    if (sortBy === "price-low") {
      products.sort(
        (a, b) =>
          Number(a?.price || 0) - Number(b?.price || 0)
      );
    }

    if (sortBy === "price-high") {
      products.sort(
        (a, b) =>
          Number(b?.price || 0) - Number(a?.price || 0)
      );
    }

    if (sortBy === "newest") {
      products.sort(
        (a, b) =>
          new Date(b?.createdAt || 0) -
          new Date(a?.createdAt || 0)
      );
    }

    if (sortBy === "rating") {
      products.sort(
        (a, b) =>
          Number(
            b?.rating ||
              b?.ratings ||
              b?.averageRating ||
              0
          ) -
          Number(
            a?.rating ||
              a?.ratings ||
              a?.averageRating ||
              0
          )
      );
    }

    return products;
  }, [
    allProducts,
    categoryFilter,
    searchQuery,
    minPrice,
    maxPrice,
    selectedRating,
    sortBy,
  ]);

  // =========================
  // PAGINATION
  // =========================
  const totalPages = Math.ceil(
    filteredProducts.length / itemsPerPage
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // =========================
  // SEARCH
  // =========================
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // =========================
  // ADD TO CART
  // =========================
  const addToCart = (product) => {
    const existing = cart.find(
      (item) => item?._id === product?._id
    );

    let newCart;

    if (existing) {
      newCart = cart.map((item) =>
        item?._id === product?._id
          ? {
              ...item,
              qty: (item.qty || 1) + 1,
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

  // =========================
  // RESET FILTERS
  // =========================
  const resetFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSelectedRating(0);
    setSearchQuery("");
    setSortBy("default");
    setCurrentPage(1);
  };

  // =========================
  // PRODUCT RATING
  // =========================
  const getRating = (product) => {
    return Number(
      product?.rating ||
        product?.ratings ||
        product?.averageRating ||
        0
    );
  };

  const getReviews = (product) => {
    return (
      product?.reviewsCount ||
      product?.reviewCount ||
      product?.reviews?.length ||
      0
    );
  };

  // =========================
  // DISCOUNT
  // =========================
  const getDiscount = (product) => {
    if (product?.discount) {
      return Number(product.discount);
    }

    if (product?.originalPrice && product?.price) {
      const discount =
        ((Number(product.originalPrice) -
          Number(product.price)) /
          Number(product.originalPrice)) *
        100;

      return Math.round(discount);
    }

    return 0;
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] pt-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-6" />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
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
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pt-28 pb-12">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-5">

        <div className="bg-white p-3 mb-4 shadow-sm">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearch}
              className="flex-1 border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
            />

            <button
              type="button"
              className="bg-black text-white px-6 py-3 font-medium"
            >
              Search
            </button>
          </div>
        </div>

    
        <button
          type="button"
          onClick={() => setMobileFilters(true)}
          className="lg:hidden flex items-center gap-2 bg-white px-4 py-3 mb-4 w-full shadow-sm text-sm font-medium"
        >
          <SlidersHorizontal size={18} />
          Filters & Sort
        </button>

        <div className="flex gap-5">

          <aside className="hidden lg:block w-[230px] shrink-0">

            <div className="bg-white p-4 sticky top-24">

              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="font-semibold text-gray-800">
                  Filters
                </h2>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-gray-700"
                >
                  Reset
                </button>
              </div>

              {/* Price */}
              <div className="py-5 border-b">
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

              {/* Rating */}
              <div className="py-5">
                <h3 className="font-medium text-sm mb-3">
                  Rating
                </h3>

                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => {
                      setSelectedRating(
                        selectedRating === rating
                          ? 0
                          : rating
                      );
                      setCurrentPage(1);
                    }}
                    className={`flex items-center gap-2 w-full py-1 text-sm ${
                      selectedRating === rating
                        ? "text-black"
                        : "text-gray-600"
                    }`}
                  >
                    <span className="flex">
                      {Array.from({
                        length: 5,
                      }).map((_, index) => (
                        <Star
                          key={index}
                          size={13}
                          fill={
                            index < rating
                              ? "currentColor"
                              : "none"
                          }
                        />
                      ))}
                    </span>

                    <span>& Up</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">

            {/* SORT BAR */}
            <div className="bg-white px-4 py-3 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">

              <div>
                <span className="text-sm text-gray-600">
                  {filteredProducts.length} Products
                </span>
              </div>

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
                  className="border border-gray-300 px-3 py-2 text-sm outline-none bg-white"
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

                  <option value="rating">
                    Top Rated
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
                      "https://github.com/scriptwithahmad/u-shop-2.0/blob/main/public/user.jpeg?raw=true";

                    const rating = getRating(product);
                    const reviews = getReviews(product);
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
                        className="bg-white cursor-pointer group"
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
                            <div className="absolute top-2 left-2 bg-[#f85606] text-white text-[10px] px-1.5 py-1">
                              -{discount}%
                            </div>
                          )}
                        </div>

                        {/* DETAILS */}
                        <div className="p-3">

                          {/* TITLE */}
                          <h2 className="text-[13px] leading-5 text-gray-800 line-clamp-2 min-h-[40px] group-hover:text-gray-900  transition">
                            {product?.title ||
                              "Untitled Product"}
                          </h2>

                          {/* PRICE */}
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-black text-lg font-medium">
                              Rs.{" "}
                              {Number(
                                product?.price || 0
                              ).toLocaleString()}
                            </span>
                          </div>

                          {/* OLD PRICE */}
                          {product?.originalPrice &&
                            Number(
                              product.originalPrice
                            ) >
                              Number(
                                product.price
                              ) && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 line-through">
                                  Rs.{" "}
                                  {Number(
                                    product.originalPrice
                                  ).toLocaleString()}
                                </span>

                                {discount > 0 && (
                                  <span className="text-xs text-gray-500">
                                    -{discount}%
                                  </span>
                                )}
                              </div>
                            )}

                          {/* RATING */}
                          <div className="flex items-center mt-2 gap-1">

                            <div className="flex text-[#faca51]">
                              {Array.from({
                                length: 5,
                              }).map(
                                (_, index) => (
                                  <Star
                                    key={index}
                                    size={12}
                                    fill={
                                      index <
                                      Math.round(
                                        rating
                                      )
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                )
                              )}
                            </div>

                            <span className="text-[11px] text-gray-400">
                              ({reviews})
                            </span>
                          </div>

                          {/* LOCATION / SHIPPING */}
                          <div className="text-[11px] text-gray-400 mt-2">
                            Free Delivery
                          </div>
                        </div>
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
                  className="mt-4 text-black text-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}

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
                  className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 disabled:opacity-40"
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
                    if (
                      page === 4
                    ) {
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
                      className={`w-10 h-10 text-sm border ${
                        currentPage === page
                          ? "bg-[#f85606] text-white border-[#f85606]"
                          : "bg-white border-gray-200 text-gray-700 hover:border-orange-500"
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
                  className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {mobileFilters && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[80]"
            onClick={() => setMobileFilters(false)}
          />

          <div className="fixed bottom-0 left-0 right-0 bg-white z-[90] rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-lg">
                Filters
              </h2>

              <button
                type="button"
                onClick={() =>
                  setMobileFilters(false)
                }
              >
                <X size={22} />
              </button>
            </div>

            {/* SORT */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Sort By
              </label>

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 px-3 py-3 text-sm"
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

                <option value="rating">
                  Top Rated
                </option>
              </select>
            </div>

            {/* PRICE */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">
                Price Range
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
                  className="w-full border px-3 py-3 text-sm"
                />

                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full border px-3 py-3 text-sm"
                />
              </div>
            </div>

            {/* RATING */}
            <div>
              <h3 className="text-sm font-medium mb-3">
                Rating
              </h3>

              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => {
                    setSelectedRating(
                      selectedRating === rating
                        ? 0
                        : rating
                    );
                    setCurrentPage(1);
                  }}
                  className="flex items-center gap-2 py-2 text-sm"
                >
                  <span className="flex text-[#faca51]">
                    {Array.from({
                      length: 5,
                    }).map((_, index) => (
                      <Star
                        key={index}
                        size={14}
                        fill={
                          index < rating
                            ? "currentColor"
                            : "none"
                        }
                      />
                    ))}
                  </span>

                  & Up
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 border border-gray-300 py-3 text-sm"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={() =>
                  setMobileFilters(false)
                }
                className="flex-1 bg-[#f85606] text-white py-3 text-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}