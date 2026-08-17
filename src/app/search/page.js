"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch products from your API with query
        const res = await axios.get(`/api/products?search=${encodeURIComponent(query)}`);
        setProducts(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchProducts();
  }, [query]);

  const handleProductClick = (id) => {
    router.push(`/products/${id}`);
  };

  if (loading) return <p className="text-center mt-10">Loading products...</p>;
  if (!products.length) return <p className="text-center mt-10">No products found for "{query}"</p>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Search results for "{query}"</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="border border-black rounded-lg bg-white cursor-pointer hover:shadow-md transition"
            onClick={() => handleProductClick(product._id)}
          >
            <div className="w-full h-48 overflow-hidden rounded-t-lg">
              <img src={product.images[0]} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <h2 className="font-bold text-lg">{product.title}</h2>
              <p className="text-gray-700 mt-1">${product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}