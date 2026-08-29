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
  const [openRow, setOpenRow] = useState(null);

  const itemsPerPage = 6;

  const getCategories = async () => {
    try {
      const res = await axios.get("/api/category");

      const categoryData =
        res.data?.Category ||
        res.data?.categories ||
        res.data?.data ||
        [];

      setCategories(
        Array.isArray(categoryData) ? categoryData : []
      );
    } catch (error) {
      console.error(
        "CATEGORY ERROR:",
        error.response?.data || error
      );

      toast.error("Failed to fetch categories.");
      setCategories([]);
    }
  };

  const getProducts = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/products");

      const products =
        res.data?.products ||
        res.data?.data ||
        [];

      setAllProducts(
        Array.isArray(products) ? products : []
      );

      setFilteredProducts(
        Array.isArray(products) ? products : []
      );
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
        p?.title
          ?.toLowerCase()
          .includes(query.toLowerCase())
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

  const paginatedProducts =
    filteredProducts.slice(
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
      const res = await axios.delete(
        `/api/products/${id}`
      );

      if (res.status >= 200 && res.status < 300) {
        setAllProducts((prev) =>
          prev.filter(
            (product) => product._id !== id
          )
        );

        setFilteredProducts((prev) =>
          prev.filter(
            (product) => product._id !== id
          )
        );

        toast.success(
          "Product deleted successfully"
        );

        setCurrentPage((prev) => {
          const remainingItems =
            filteredProducts.length - 1;

          const newTotalPages = Math.max(
            1,
            Math.ceil(
              remainingItems / itemsPerPage
            )
          );

          return Math.min(
            prev,
            newTotalPages
          );
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
    <div className="p-2 sm:p-4 md:p-6">

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-4">

        {/* Search */}
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearch}
          className="border border-gray-300 px-3 py-2 rounded-md w-full sm:w-1/2 outline-none focus:border-black"
        />

        {/* Category + Add */}
        <div className="flex items-center gap-2 sm:gap-3">

          <select
            className="border border-gray-300 px-2 sm:px-3 py-2 rounded-md w-full sm:w-auto text-sm sm:text-base outline-none"
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
            className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center border border-black rounded-full text-2xl hover:bg-black hover:text-white transition"
          >
            +
          </Link>

        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden">

        <table className="w-full table-auto text-xs sm:text-sm md:text-base text-gray-600">

          <thead className="bg-black text-white">

            <tr>

              {/* Product - Always visible */}
              <th className="p-2 sm:p-3 md:p-4 text-left">
                Product
              </th>

              {/* Stock - Hidden on SM */}
              <th className="hidden md:table-cell p-2 sm:p-3 md:p-4 text-left">
                Stock
              </th>

              {/* Category - Hidden on SM and MD */}
              <th className="hidden md:table-cell p-2 sm:p-3 md:p-4 text-left">
                Category
              </th>

              {/* Price - Always visible */}
              <th className="p-2 sm:p-3 md:p-4 text-left">
                Price
              </th>

              {/* Actions - Always visible */}
              <th className="p-2 sm:p-3 md:p-4 text-left">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {paginatedProducts.map((product) => (

              <React.Fragment key={product._id}>

                {/* MAIN ROW */}
                <tr
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    setOpenRow(
                      openRow === product._id
                        ? null
                        : product._id
                    )
                  }
                >

                  {/* PRODUCT */}
                  <td className="p-2 sm:p-3 md:p-4">

                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">

                      {/* IMAGE */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">

                        <img
                          src={
                            product?.images?.[0] ||
                            "https://github.com/scriptwithahmad/u-shop-2.0/blob/main/public/user.jpeg?raw=true"
                          }
                          alt={
                            product?.title ||
                            "product"
                          }
                          className="w-full h-full object-cover block"
                        />

                      </div>

                      {/* TITLE */}
                      <div className="min-w-0 flex-1">

                        <p className="font-medium text-gray-900 truncate max-w-[130px] sm:max-w-[220px] md:max-w-[300px]">
                          {product?.title ||
                            "Untitled Product"}
                        </p>

                      </div>

                    </div>

                  </td>

                  {/* STOCK */}
                  <td className="hidden md:table-cell p-2 sm:p-3 md:p-4 whitespace-nowrap">
                    {product?.stock}
                  </td>

                  {/* CATEGORY */}
                  <td className="hidden md:table-cell p-2 sm:p-3 md:p-4">

                    <span className="block truncate max-w-[150px]">
                      {product?.category?.title ||
                        "N/A"}
                    </span>

                  </td>

                  {/* PRICE */}
                  <td className="p-2 sm:p-3 md:p-4 font-semibold whitespace-nowrap">
                    Rs. {product?.price}
                  </td>

                  {/* ACTIONS */}
                  <td
                    className="p-2 sm:p-3 md:p-4"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >

                    <div className="flex items-center gap-3 sm:gap-4">

                      {/* DELETE */}
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            product._id
                          )
                        }
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2Icon
                          size={17}
                          className="sm:w-[18px] sm:h-[18px]"
                        />
                      </button>

                      {/* EDIT */}
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/admin/products/update/${product._id}`
                          )
                        }
                        className="text-black hover:text-gray-600"
                        title="Edit"
                      >
                        <SquarePen
                          size={17}
                          className="sm:w-[18px] sm:h-[18px]"
                        />
                      </button>

                    </div>

                  </td>

                </tr>

                {/* MOBILE EXPANDED ROW */}
                {openRow === product._id && (

                  <tr className="md:hidden bg-gray-50">

                    <td
                      colSpan={3}
                      className="p-3 text-xs space-y-2"
                    >

                      {/* Stock */}
                      <div className="flex justify-between items-center">

                        <span className="text-gray-500">
                          Stock:
                        </span>

                        <span className="font-medium text-black">
                          {product?.stock}
                        </span>

                      </div>

                      {/* Category */}
                      <div className="flex justify-between items-center gap-4">

                        <span className="text-gray-500">
                          Category:
                        </span>

                        <span className="font-medium text-black truncate max-w-[180px]">
                          {product?.category?.title ||
                            "N/A"}
                        </span>

                      </div>

                    </td>

                  </tr>

                )}

              </React.Fragment>

            ))}

          </tbody>

        </table>

        {loading && (
          <p className="text-center py-5">
            Loading...
          </p>
        )}

        {!loading &&
          filteredProducts.length === 0 && (
            <p className="text-center py-5">
              No products found
            </p>
          )}

      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (

        <div className="flex justify-center items-center mt-6 gap-2 sm:gap-4">

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.max(prev - 1, 1)
              )
            }
            disabled={currentPage === 1}
            className="px-3 sm:px-4 py-2 border rounded disabled:opacity-50 text-xs sm:text-sm"
          >
            Previous
          </button>

          <span className="px-3 sm:px-4 py-2 border rounded text-xs sm:text-sm whitespace-nowrap">
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
            disabled={
              currentPage === totalPages
            }
            className="px-3 sm:px-4 py-2 border rounded disabled:opacity-50 text-xs sm:text-sm"
          >
            Next
          </button>

        </div>

      )}

    </div>
  );
};

export default Page;
