"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Products() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFilter = searchParams?.get("category");

  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState({});

  const itemsPerPage = 12;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/products");
      const products = res.data.products || [];
      setAllProducts(products);

      if (categoryFilter) {
        const filtered = products.filter(
          (p) =>
            (p.category?._id === categoryFilter) ||
            (typeof p.category === "string" && p.category === categoryFilter)
        );
        const remaining = products.filter((p) => !filtered.includes(p));
        setFilteredProducts([...filtered, ...remaining]);
      } else {
        setFilteredProducts(products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  useEffect(() => {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(localCart);
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setCurrentPage(1);
    const filtered = allProducts.filter((p) =>
      p.title.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  };

  const addToCart = (product) => {
    const existing = cart.find((p) => p._id === product._id);
    let newCart;
    if (existing) {
      newCart = cart.map((p) =>
        p._id === product._id ? { ...p, qty: p.qty + 1 } : p
      );
    } else {
      newCart = [...cart, { ...product, qty: 1 }];
    }
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  if (loading)
    return <p className="text-center mt-10 text-lg">Loading products...</p>;

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderProducts = (products) =>
    products.map((product) => {
      const images = product.images || [];
      const index = hoveredIndex[product._id] || 0;

      return (
        <motion.div
          key={product._id}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="relative border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transform hover:scale-105 transition cursor-pointer"
        >
          <div
            className="relative w-full h-80"
            onMouseEnter={() => {
              if (images.length > 1)
                setHoveredIndex({ ...hoveredIndex, [product._id]: 1 });
            }}
            onMouseLeave={() => {
              if (images.length > 1)
                setHoveredIndex({ ...hoveredIndex, [product._id]: 0 });
            }}
          >
            <AnimatePresence initial={false}>
              <motion.img
                key={index}
                src={images[index]}
                alt={product.title}
                className="w-full h-80 object-cover absolute top-0 left-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                onClick={() => router.push(`/products/${product._id}`)}
              />
            </AnimatePresence>
          </div>

          <div className="p-4 flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-gray-800">{product.title}</h2>
            <p className="text-red-600 font-medium">Price ${product.price}</p>
            <button
              onClick={() => addToCart(product)}
              className="mt-2 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition font-medium"
            >
              Add to Cart
            </button>
          </div>
        </motion.div>
      );
    });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearch}
            className="border border-gray-300 px-4 py-3 rounded-full w-full max-w-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {renderProducts(paginatedProducts)}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-400 rounded-full hover:bg-black hover:text-white transition disabled:opacity-50"
            >
              Prev
            </button>
            <span className="font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
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