"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

function Search() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("query") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!query.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const res = await axios.get(
          `/api/products?search=${encodeURIComponent(query)}`
        );

        const fetchedProducts = Array.isArray(res.data?.products)
          ? res.data.products
          : Array.isArray(res.data)
          ? res.data
          : [];

        setProducts(fetchedProducts);
      } catch (error) {
        console.error(
          "SEARCH PRODUCTS ERROR:",
          error.response?.data || error
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query]);

  const handleProductClick = (id) => {
    router.push(`/products/${id}`);
  };

  if (loading) {
    return (
      <p className="text-center mt-10">
        Loading products...
      </p>
    );
  }

  if (!query.trim()) {
    return (
      <p className="text-center mt-10">
        Enter a product name to search.
      </p>
    );
  }

  if (!products.length) {
    return (
      <p className="text-center mt-10">
        No products found for "{query}"
      </p>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">
        Search results for "{query}"
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const images = Array.isArray(product?.images)
            ? product.images
            : [];

          const image =
            images[0] ||
            "https://github.com/scriptwithahmad/u-shop-2.0/blob/main/public/user.jpeg?raw=true";

          return (
            <div
              key={product._id}
              className="border border-black rounded-lg bg-white cursor-pointer hover:shadow-md transition overflow-hidden"
              onClick={() =>
                handleProductClick(product._id)
              }
            >
              <div className="w-full h-48 overflow-hidden">
                <img
                  src={image}
                  alt={product?.title || "Product"}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-3">
                <h2 className="font-bold text-lg">
                  {product?.title || "Untitled Product"}
                </h2>

                <p className="text-gray-700 mt-1">
                  ${product?.price || 0}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default function searchPage(){
  return(
    <Suspense
    fallback={
        <p className="text-center mt-10 text-lg">
          Loading products...
        </p>
      }>
        <search />
    </Suspense>
  )
}