"use client";

import { Suspense, useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

function ProductsContent() {
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
          const filtered = products.filter(
            (p) =>
              p?.category?._id === categoryFilter ||
              p?.category === categoryFilter
          );

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
      const localCart =
        JSON.parse(localStorage.getItem("cart")) || [];

      setCart(Array.isArray(localCart) ? localCart : []);
    } catch (error) {
      console.error("CART ERROR:", error);
      setCart([]);
    }
  }, []);

const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();

    setSearchQuery(query);
    setCurrentPage(1);

    let products = [...allProducts];

    // Category filter
    if (categoryFilter) {
      products = products.filter(
        (p) =>
          p?.category?._id === categoryFilter ||
          p?.category === categoryFilter
      );
    }

    // Search filter
    if (query) {
      products = products.filter((p) =>
        p?.title?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(products);
  };

 const addToCart = (product) => {
    const existing = cart.find(
      (p) => p._id === product._id
    );

    let newCart;

    if (existing) {
      newCart = cart.map((p) =>
        p._id === product._id
          ? { ...p, qty: (p.qty || 0) + 1 }
          : p
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

 const renderProducts = (products) => {
    if (!Array.isArray(products)) {
      return null;
    }

    return products.map((product) => {
      const images = Array.isArray(product?.images)
        ? product.images
        : [];

      const index =
        hoveredIndex[product._id] || 0;

      // Don't render broken image URL
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
          className="relative border border-black rounded-xl overflow-hidden bg-white shadow hover:shadow-2xl transform hover:scale-105 transition cursor-pointer"
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
          {/* IMAGE */}
          <div className="relative w-full h-80">
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
                  duration: 0.5,
                }}
                onClick={() =>
                  router.push(
                    `/products/${product._id}`
                  )
                }
              />
            </AnimatePresence>
          </div>

          {/* DETAILS */}
          <div className="p-4 flex flex-col gap-2">
            <h2 className="text-lg font-bold">
              {product?.title || "Untitled Product"}
            </h2>

            <p className="text-red-700">
              Price ${product?.price || 0}
            </p>

            <button
              onClick={() =>
                addToCart(product)
              }
              className="mt-2 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
            >
              Add to Cart
            </button>
          </div>
        </motion.div>
      );
    });
  };

  return (
    <div className="p-8 min-h-screen">

      <h1 className="text-4xl font-bold mb-8">
        {categoryFilter
          ? "Filtered Products"
          : "All Products"}
      </h1>

      {/* SEARCH */}
      <div className="flex justify-between mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearch}
          className="border border-gray-300 px-3 py-2 rounded-md w-1/2"
        />
      </div>

      {/* PRODUCTS */}
      {paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {renderProducts(
            paginatedProducts
          )}
        </div>
      ) : (
        <p className="text-center mt-10 text-lg">
          No products found.
        </p>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">

          <button
            onClick={() =>
              setCurrentPage((p) =>
                Math.max(p - 1, 1)
              )
            }
            disabled={currentPage === 1}
            className="px-3 py-1 border border-black rounded hover:bg-black hover:text-white transition disabled:opacity-50"
          >
            Prev
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(
                  p + 1,
                  totalPages
                )
              )
            }
            disabled={
              currentPage === totalPages
            }
            className="px-3 py-1 border border-black rounded hover:bg-black hover:text-white transition disabled:opacity-50"
          >
            Next
          </button>

        </div>
      )}
    </div>
  );
}

export default function Products() {
  return (
    <Suspense
      fallback={
        <p className="text-center mt-10 text-lg">
          Loading products...
        </p>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}