"use client";
import axios from "axios";
import { SquarePen, Trash2Icon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Page = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 6;

  // Fetch categories
  const getCategories = async () => {
    try {
      const res = await axios.get("/api/category");
      if (res.data) {
        setCategories(res.data.Category || []);
      }
    } catch (err) {
      toast.error("Failed to fetch categories.");
    }
  };

  // Fetch products
  const getProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/products");
      if (res.data.success) {
        setAllProducts(res.data.products || []);
        setFilteredProducts(res.data.products || []);
      }
    } catch (err) {
      toast.error("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const applyFilters = (query, categoryId, productList = allProducts) => {
    let filtered = [...productList];

    if (categoryId) {
      filtered = filtered.filter((p) => p?.category?._id === categoryId);
    }

    if (query) {
      filtered = filtered.filter((p) =>
        p?.title?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    applyFilters(searchQuery, categoryId);
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setCurrentPage(1);
    applyFilters(query, selectedCategory);
  };

  useEffect(() => {
    getCategories();
    getProducts();
  }, []);

  // Pagination
  const totalPages = Math.ceil((filteredProducts?.length || 0) / itemsPerPage);

  const paginatedProducts = (filteredProducts || []).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Delete product
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure to delete this product?");
    if (!confirmDelete) return;

    try {
      const res = await axios.delete(`/api/products/${id}`);

      if (res.data.success) {
        toast.success("Product deleted successfully");
        getProducts();
      } else {
        toast.error("Delete failed");
      }
    } catch (error) {
      toast.error("Delete failed");
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
            <option value="">All Categories</option>

            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
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
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedProducts.map((v) => (
              <tr key={v._id} className="bg-white border-b">
                <td className="px-6 py-4 flex items-center gap-3">

                  <div className="w-10 h-10 border rounded-full overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src={
                        v?.images?.[0] ||
                        "https://github.com/scriptwithahmad/u-shop-2.0/blob/main/public/user.jpeg?raw=true"
                      }
                      alt="product"
                    />
                  </div>

                  {v?.title}
                </td>

                <td className="px-6 py-4">{v?.stock}</td>

                <td className="px-6 py-4">
                  {v?.category?.title || "N/A"}
                </td>

                <td className="px-6 py-4">${v?.price}</td>

                <td className="px-6 py-4 flex gap-4">
                  <button
                    onClick={() => handleDelete(v._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2Icon size={18} />
                  </button>

                  <Link
                    href={`/admin/products/update/${v._id}`}
                    className="text-black"
                  >
                    <SquarePen size={18} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <p className="text-center mt-4">Loading...</p>
        )}

        {!loading && filteredProducts.length === 0 && (
          <p className="text-center mt-4">No products found</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-4">

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.max(prev - 1, 1))
            }
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded"
          >
            Previous
          </button>

          <span className="px-4 py-2 border rounded">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, totalPages)
              )
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded"
          >
            Next
          </button>

        </div>
      )}
    </div>
  );
};

export default Page;