"use client";

import axios from "axios";
import { SquarePen, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Page = () => {
  const router = useRouter();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 6;

const getCategories = async () => {
    try {
      const res = await axios.get("/api/category");

      console.log("CATEGORY RESPONSE:", res.data);

      const categoryData =
        res.data?.Category ||
        res.data?.categories ||
        res.data?.data ||
        [];

      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (error) {
      console.error("CATEGORY ERROR:", error.response?.data || error);
      toast.error("Failed to fetch categories.");
      setCategories([]);
    }
  };

const getProducts = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/products");

      console.log("PRODUCT RESPONSE:", res.data);

      const products = res.data?.products || res.data?.data || [];

      setAllProducts(Array.isArray(products) ? products : []);
      setFilteredProducts(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error(
        "FETCH PRODUCTS ERROR:",
        error.response?.data || error
      );

      toast.error("Failed to fetch products.");

      setAllProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };
const applyFilters = (
    query,
    categoryId,
    productList = allProducts
  ) => {
    let filtered = [...productList];

    if (categoryId) {
      filtered = filtered.filter(
        (p) => p?.category?._id === categoryId
      );
    }

    if (query) {
      filtered = filtered.filter((p) =>
        p?.title?.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;

    setSelectedCategory(categoryId);
    setCurrentPage(1);

    applyFilters(
      searchQuery,
      categoryId,
      allProducts
    );
  };

  const handleSearch = (e) => {
    const query = e.target.value;

    setSearchQuery(query);
    setCurrentPage(1);

    applyFilters(
      query,
      selectedCategory,
      allProducts
    );
  };
useEffect(() => {
    getCategories();
    getProducts();
  }, []);

 const totalPages = Math.ceil(
    filteredProducts.length / itemsPerPage
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

 const handleDelete = async (id) => {
    if (!id) {
      toast.error("Product ID is missing");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      const res = await axios.delete(`/api/products/${id}`);

      console.log("DELETE RESPONSE:", res.data);
      console.log("DELETE STATUS:", res.status);

      // HTTP 200/204 means the request succeeded.
      if (res.status >= 200 && res.status < 300) {
        toast.success("Product deleted successfully");

       
        setAllProducts((prev) =>
          prev.filter((product) => product._id !== id)
        );

        setFilteredProducts((prev) =>
          prev.filter((product) => product._id !== id)
        );

        
        setCurrentPage((prev) => {
          const remainingItems = filteredProducts.length - 1;
          const newTotalPages = Math.max(
            1,
            Math.ceil(remainingItems / itemsPerPage)
          );

          return Math.min(prev, newTotalPages);
        });
      } else {
        toast.error("Delete failed");
      }
    } catch (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          "Delete failed"
      );
    }
  };

  return (
    <div className="p-4">

      {/* Search + Filter */}
      <div className="flex justify-between mb-4">

        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearch}
          className="border border-gray-300 px-3 py-2 rounded-md w-1/2"
        />

        <div className="flex items-center gap-3">

          <select
            className="border border-gray-300 px-3 py-2 rounded-md"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">
              All Categories
            </option>

            {categories.map((cat) => (
              <option
                key={cat._id}
                value={cat._id}
              >
                {cat.title}
              </option>
            ))}
          </select>

          <Link
            href="/admin/products/form"
            title="Add Product"
            className="cursor-pointer text-4xl"
          >
            +
          </Link>

        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto">

        <table className="w-full text-sm text-left text-gray-500">

          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">
                Product
              </th>

              <th className="px-6 py-3">
                Stock
              </th>

              <th className="px-6 py-3">
                Category
              </th>

              <th className="px-6 py-3">
                Price
              </th>

              <th className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>

            {paginatedProducts.map((product) => (
              <tr
                key={product._id}
                className="bg-white border-b"
              >

                {/* Product */}
                <td className="px-6 py-4 flex items-center gap-3">

                  <div className="w-10 h-10 border rounded-full overflow-hidden">

                    <img
                      className="w-full h-full object-cover"
                      src={
                        product?.images?.[0] ||
                        "https://github.com/scriptwithahmad/u-shop-2.0/blob/main/public/user.jpeg?raw=true"
                      }
                      alt={product?.title || "product"}
                    />

                  </div>

                  {product?.title}

                </td>

                {/* Stock */}
                <td className="px-6 py-4">
                  {product?.stock}
                </td>

                {/* Category */}
                <td className="px-6 py-4">
                  {product?.category?.title || "N/A"}
                </td>

                {/* Price */}
                <td className="px-6 py-4">
                  Rs. {product?.price}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 flex gap-4">

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(product._id)
                    }
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2Icon size={18} />
                  </button>

                  {/* Edit */}
                  <button
  type="button"
  onClick={() =>
    router.push(`/admin/products/update/${product._id}`)
  }
  className="text-black hover:text-gray-600"
  title="Edit"
>
  <SquarePen size={18} />
</button>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

        {loading && (
          <p className="text-center mt-4">
            Loading...
          </p>
        )}

        {!loading &&
          filteredProducts.length === 0 && (
            <p className="text-center mt-4">
              No products found
            </p>
          )}

      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-4">

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.max(prev - 1, 1)
              )
            }
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="px-4 py-2 border rounded">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(
                  prev + 1,
                  totalPages
                )
              )
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>

        </div>
      )}

    </div>
  );
};

export default Page;