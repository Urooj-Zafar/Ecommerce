"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryFilter = searchParams.get("category");

  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState([]);

  const [hoveredIndex, setHoveredIndex] = useState({});

  const [sortBy, setSortBy] = useState("default");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [mobileFilters, setMobileFilters] = useState(false);

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

        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);


  useEffect(() => {
    try {
      const localCart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      setCart(
        Array.isArray(localCart)
          ? localCart
          : []
      );
    } catch (error) {
      console.error("CART ERROR:", error);
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

    // CATEGORY
    products = products.filter(
      belongsToCategory
    );

    // SEARCH
    if (searchQuery.trim()) {
      const query = searchQuery
        .toLowerCase()
        .trim();

      products = products.filter((product) =>
        product?.title
          ?.toLowerCase()
          .includes(query)
      );
    }

    // MIN PRICE
    if (minPrice !== "") {
      products = products.filter(
        (product) =>
          Number(product?.price || 0) >=
          Number(minPrice)
      );
    }

    // MAX PRICE
    if (maxPrice !== "") {
      products = products.filter(
        (product) =>
          Number(product?.price || 0) <=
          Number(maxPrice)
      );
    }

    // SORT
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

  const paginatedProducts =
    filteredProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );


  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };


  const addToCart = (product) => {
    const existing = cart.find(
      (item) =>
        item?._id === product?._id
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

    window.dispatchEvent(
      new Event("cartUpdated")
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("default");
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


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 pt-28 pb-12">
        <div className="max-w-[1400px] mx-auto px-4">

          <div className="h-8 w-48 bg-gray-200 animate-pulse mb-6" />

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
                  className="bg-white"
                >
                  <div className="
                    aspect-square
                    bg-gray-200
                    animate-pulse
                  " />

                  <div className="p-3 space-y-2">
                    <div className="
                      h-4
                      bg-gray-200
                      animate-pulse
                    " />

                    <div className="
                      h-4
                      w-1/2
                      bg-gray-200
                      animate-pulse
                    " />

                    <div className="
                      h-5
                      w-2/3
                      bg-gray-200
                      animate-pulse
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
      pb-12
    ">

      <div className="
        max-w-[1400px]
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
            {categoryFilter
              ? "Products"
              : "All Products"}
          </h1>

          <p className="
            text-sm
            text-gray-500
            mt-1
          ">
            Find the products you are looking for
          </p>

        </div>

        <div className="
          bg-white
          p-3
          mb-4
          shadow-sm
        ">

          <div className="flex gap-2">

            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearch}
              className="
                flex-1
                border
                border-gray-300
                px-4
                py-3
                text-sm
                outline-none
                focus:border-black
                transition
              "
            />

            <button
              type="button"
              className="
                bg-black
                text-white
                px-6
                py-3
                font-medium
                hover:bg-gray-800
                transition
              "
            >
              Search
            </button>

          </div>
        </div>

   

        <button
          type="button"
          onClick={() =>
            setMobileFilters(true)
          }
          className="
            lg:hidden
            w-full
            bg-white
            border
            border-gray-200
            py-3
            mb-4
            flex
            items-center
            justify-center
            gap-2
            text-sm
            font-medium
          "
        >
          <SlidersHorizontal size={18} />
          Filters & Sort
        </button>

        <div className="flex gap-5">

          <aside className="
            hidden
            lg:block
            w-[230px]
            shrink-0
          ">

            <div className="
              bg-white
              p-4
              sticky
              top-24
              shadow-sm
            ">

              <div className="
                flex
                items-center
                justify-between
                pb-4
                border-b
                border-gray-200
              ">

                <h2 className="
                  font-semibold
                  text-gray-800
                ">
                  Filters
                </h2>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="
                    text-xs
                    text-gray-500
                    hover:text-black
                  "
                >
                  Reset
                </button>

              </div>

              {/* PRICE */}

              <div className="
                py-5
                border-b
                border-gray-200
              ">

                <h3 className="
                  text-sm
                  font-medium
                  mb-4
                ">
                  Price
                </h3>

                <div className="flex gap-2">

                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(
                        e.target.value
                      );
                      setCurrentPage(1);
                    }}
                    className="
                      w-full
                      border
                      border-gray-300
                      px-2
                      py-2
                      text-xs
                      outline-none
                      focus:border-black
                    "
                  />

                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(
                        e.target.value
                      );
                      setCurrentPage(1);
                    }}
                    className="
                      w-full
                      border
                      border-gray-300
                      px-2
                      py-2
                      text-xs
                      outline-none
                      focus:border-black
                    "
                  />

                </div>
              </div>

              {/* QUICK PRICE */}

              <div className="py-5">

                <h3 className="
                  text-sm
                  font-medium
                  mb-3
                ">
                  Price Range
                </h3>

                <div className="space-y-3">

                  <button
                    type="button"
                    onClick={() => {
                      setMinPrice("");
                      setMaxPrice("1000");
                      setCurrentPage(1);
                    }}
                    className="
                      block
                      text-sm
                      text-gray-600
                      hover:text-black
                    "
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
                    className="
                      block
                      text-sm
                      text-gray-600
                      hover:text-black
                    "
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
                    className="
                      block
                      text-sm
                      text-gray-600
                      hover:text-black
                    "
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
                    className="
                      block
                      text-sm
                      text-gray-600
                      hover:text-black
                    "
                  >
                    Above Rs. 10,000
                  </button>

                </div>
              </div>

            </div>
          </aside>

          <main className="
            flex-1
            min-w-0
          ">

            {/* SORT BAR */}

            <div className="
              bg-white
              px-4
              py-3
              mb-4
              flex
              items-center
              justify-between
              gap-3
              shadow-sm
              flex-wrap
            ">

              <span className="
                text-sm
                text-gray-600
              ">
                {filteredProducts.length} Products
              </span>

              <div className="
                flex
                items-center
                gap-2
              ">

                <span className="
                  hidden
                  sm:block
                  text-sm
                  text-gray-500
                ">
                  Sort By:
                </span>

                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="
                    border
                    border-gray-300
                    px-3
                    py-2
                    text-sm
                    outline-none
                    bg-white
                    focus:border-black
                  "
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

              <div className="
                grid
                grid-cols-2
                sm:grid-cols-3
                md:grid-cols-4
                lg:grid-cols-6
                gap-3
              ">

                {paginatedProducts.map(
                  (product, index) => {

                    const images =
                      Array.isArray(
                        product?.images
                      )
                        ? product.images
                        : [];

                    const imageIndex =
                      hoveredIndex[
                        product?._id
                      ] || 0;

                    const imageSrc =
                      images[imageIndex] ||
                      images[0] ||
                      "https://github.com/scriptwithahmad/u-shop-2.0/blob/main/public/user.jpeg?raw=true";

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
                            index * 0.02,
                        }}
                        className="
                          bg-white
                          cursor-pointer
                          group
                          overflow-hidden
                          border
                          border-transparent
                          hover:border-gray-300
                          hover:shadow-md
                          transition
                        "
                        onMouseEnter={() => {
                          if (
                            images.length > 1
                          ) {
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

                        {/* IMAGE */}

                        <div
                          className="
                            relative
                            aspect-square
                            bg-gray-50
                            overflow-hidden
                          "
                          onClick={() =>
                            router.push(
                              `/products/${product?._id}`
                            )
                          }
                        >

                          <img
                            src={imageSrc}
                            alt={
                              product?.title ||
                              "Product"
                            }
                            className="
                              w-full
                              h-full
                              object-cover
                              group-hover:scale-105
                              transition-transform
                              duration-300
                            "
                          />

                          {/* DISCOUNT */}

                          {discount > 0 && (
                            <span className="
                              absolute
                              top-2
                              left-2
                              bg-black
                              text-white
                              text-[10px]
                              px-2
                              py-1
                              font-medium
                            ">
                              -{discount}%
                            </span>
                          )}

                        </div>

                        {/* DETAILS */}

                        <div className="p-3">

                          <h2 className="
                            text-[13px]
                            leading-5
                            text-gray-800
                            line-clamp-2
                            min-h-[40px]
                          ">
                            {product?.title ||
                              "Untitled Product"}
                          </h2>

                          {/* CURRENT PRICE */}

                          <div className="mt-2">

                            <span className="
                              text-lg
                              font-semibold
                              text-black
                            ">
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

                              <div className="
                                flex
                                items-center
                                gap-2
                                mt-1
                              ">

                                <span className="
                                  text-xs
                                  text-gray-400
                                  line-through
                                ">
                                  Rs.{" "}
                                  {Number(
                                    product.originalPrice
                                  ).toLocaleString()}
                                </span>

                                {discount > 0 && (
                                  <span className="
                                    text-xs
                                    text-gray-500
                                  ">
                                    -{discount}%
                                  </span>
                                )}

                              </div>
                          )}

                          {/* DELIVERY */}

                          <p className="
                            text-[11px]
                            text-gray-400
                            mt-2
                          ">
                            Free Delivery
                          </p>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            className="
                              w-full
                              mt-3
                              py-2.5
                              bg-black
                              text-white
                              text-sm
                              font-medium
                              hover:bg-gray-800
                              transition
                            "
                          >
                            Add to Cart
                          </button>

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

                <p className="
                  text-gray-500
                  text-lg
                ">
                  No products found.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="
                    mt-4
                    text-sm
                    underline
                    text-black
                  "
                >
                  Clear Filters
                </button>

              </div>
            )}

            {totalPages > 1 && (

              <div className="
                flex
                justify-center
                items-center
                gap-2
                mt-8
              ">

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.max(page - 1, 1)
                    )
                  }
                  disabled={
                    currentPage === 1
                  }
                  className="
                    w-10
                    h-10
                    flex
                    items-center
                    justify-center
                    bg-white
                    border
                    border-gray-300
                    hover:bg-black
                    hover:text-white
                    disabled:opacity-40
                    transition
                  "
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({
                  length: totalPages,
                }).map((_, index) => {

                  const page = index + 1;

                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() =>
                        setCurrentPage(page)
                      }
                      className={`
                        w-10
                        h-10
                        border
                        text-sm
                        transition
                        ${
                          currentPage === page
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-black hover:text-white"
                        }
                      `}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(
                        page + 1,
                        totalPages
                      )
                    )
                  }
                  disabled={
                    currentPage === totalPages
                  }
                  className="
                    w-10
                    h-10
                    flex
                    items-center
                    justify-center
                    bg-white
                    border
                    border-gray-300
                    hover:bg-black
                    hover:text-white
                    disabled:opacity-40
                    transition
                  "
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
          {/* OVERLAY */}

          <div
            className="
              fixed
              inset-0
              bg-black/50
              z-[80]
            "
            onClick={() =>
              setMobileFilters(false)
            }
          />

          {/* DRAWER */}

          <div className="
            fixed
            bottom-0
            left-0
            right-0
            bg-white
            z-[90]
            rounded-t-2xl
            p-5
            max-h-[80vh]
            overflow-y-auto
          ">

            {/* HEADER */}

            <div className="
              flex
              items-center
              justify-between
              mb-6
            ">

              <h2 className="
                text-lg
                font-semibold
              ">
                Filters & Sort
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

              <label className="
                block
                text-sm
                font-medium
                mb-2
              ">
                Sort By
              </label>

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="
                  w-full
                  border
                  border-gray-300
                  px-3
                  py-3
                  text-sm
                  outline-none
                  focus:border-black
                "
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

            {/* PRICE */}

            <div className="mb-6">

              <h3 className="
                text-sm
                font-medium
                mb-3
              ">
                Price Range
              </h3>

              <div className="flex gap-2">

                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(
                      e.target.value
                    );
                    setCurrentPage(1);
                  }}
                  className="
                    w-full
                    border
                    border-gray-300
                    px-3
                    py-3
                    text-sm
                    outline-none
                    focus:border-black
                  "
                />

                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(
                      e.target.value
                    );
                    setCurrentPage(1);
                  }}
                  className="
                    w-full
                    border
                    border-gray-300
                    px-3
                    py-3
                    text-sm
                    outline-none
                    focus:border-black
                  "
                />

              </div>
            </div>

            {/* QUICK PRICE */}

            <div>

              <h3 className="
                text-sm
                font-medium
                mb-3
              ">
                Quick Price
              </h3>

              <div className="space-y-3">

                <button
                  type="button"
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("1000");
                    setCurrentPage(1);
                  }}
                  className="
                    block
                    text-sm
                    text-gray-600
                    hover:text-black
                  "
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
                  className="
                    block
                    text-sm
                    text-gray-600
                    hover:text-black
                  "
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
                  className="
                    block
                    text-sm
                    text-gray-600
                    hover:text-black
                  "
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
                  className="
                    block
                    text-sm
                    text-gray-600
                    hover:text-black
                  "
                >
                  Above Rs. 10,000
                </button>

              </div>
            </div>

            {/* ACTIONS */}

            <div className="
              flex
              gap-3
              mt-8
            ">

              <button
                type="button"
                onClick={resetFilters}
                className="
                  flex-1
                  py-3
                  border
                  border-black
                  text-black
                  text-sm
                  hover:bg-black
                  hover:text-white
                  transition
                "
              >
                Reset
              </button>

              <button
                type="button"
                onClick={() =>
                  setMobileFilters(false)
                }
                className="
                  flex-1
                  py-3
                  bg-black
                  text-white
                  text-sm
                  hover:bg-gray-800
                  transition
                "
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

export default function Products() {
  return (
    <Suspense
      fallback={
        <div className="
          min-h-screen
          bg-gray-100
          pt-28
          flex
          justify-center
        ">
          <p className="
            text-gray-600
            text-sm
          ">
            Loading products...
          </p>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}