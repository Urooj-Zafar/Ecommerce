"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  X,
  Edit2,
  Trash2,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { CldUploadWidget } from "next-cloudinary";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState(null);

  const [openRow, setOpenRow] = useState(null);

  const [editForm, setEditForm] = useState({
    title: "",
    images: [],
  });


  const fetchCategories = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/category");

      setCategories(res.data.Category || []);
    } catch (err) {
      console.error(
        "CATEGORY ERROR:",
        err.response?.data || err
      );

      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);


  const handleDeleteClick = (cat) => {
    setSelectedCategory(cat);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategory?._id) return;

    try {
      await axios.delete(
        `/api/category/${selectedCategory._id}`
      );

      setCategories((prev) =>
        prev.filter(
          (c) => c._id !== selectedCategory._id
        )
      );

      toast.success("Category deleted");
    } catch (error) {
      console.error(
        "DELETE CATEGORY ERROR:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          "Delete failed"
      );
    }

    setShowDeleteModal(false);
    setSelectedCategory(null);
  };

  const handleEditClick = (cat) => {
    setSelectedCategory(cat);

    setEditForm({
      title: cat.title || "",
      images: cat.images || [],
    });

    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory?._id) return;

    try {
      await axios.put(
        `/api/category/${selectedCategory._id}`,
        editForm
      );

      toast.success("Category updated");

      setShowEditModal(false);
      setSelectedCategory(null);

      fetchCategories();
    } catch (error) {
      console.error(
        "UPDATE CATEGORY ERROR:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          "Update failed"
      );
    }
  };

 
  const removeImage = (index) => {
    setEditForm((prev) => ({
      ...prev,
      images: prev.images.filter(
        (_, i) => i !== index
      ),
    }));
  };

  return (
    <div className="p-2 sm:p-4 md:p-6">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">

        <div>
          <h1 className="text-3xl md:text-4xl font-bold">
            Categories
          </h1>

          <p className="text-gray-500 mt-1 text-sm">
            Manage your store categories
          </p>
        </div>

        <Link href="/admin/category/form">

          <button
            type="button"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-4 sm:px-5 py-2.5 rounded-md hover:bg-gray-800 transition"
          >
            <Plus size={18} />
            Create Category
          </button>

        </Link>

      </div>

      {/* LOADING */}

      {loading && (
        <div className="border border-black rounded-xl p-8 text-center text-gray-500">
          Loading categories...
        </div>
      )}

      {/* EMPTY */}

      {!loading && categories.length === 0 && (
        <div className="border border-black rounded-xl p-8 text-center text-gray-500">
          No categories found
        </div>
      )}

      {/* TABLE */}

      {!loading && categories.length > 0 && (

        <div className="overflow-hidden bg-white">

          <table className="w-full table-auto text-xs sm:text-sm md:text-base text-gray-600">

            {/* HEADER */}

            <thead className="bg-black text-white">

              <tr>

                {/* NUMBER - HIDDEN ON SM */}

                <th className="hidden md:table-cell p-2 sm:p-3 md:p-4 text-left">
                  #
                </th>

                {/* IMAGE */}

                <th className="p-2 sm:p-3 md:p-4 text-left">
                  Image
                </th>

                {/* CATEGORY */}

                <th className="p-2 sm:p-3 md:p-4 text-left">
                  Category
                </th>

                {/* ACTIONS */}

                <th className="p-2 sm:p-3 md:p-4 text-right">
                  Actions
                </th>

              </tr>

            </thead>

            {/* BODY */}

            <tbody>

              {categories.map((cat, index) => (

                <React.Fragment key={cat._id}>

                  {/* MAIN ROW */}

                  <tr
                    className="border-b hover:bg-gray-50 transition cursor-pointer"
                    onClick={() =>
                      setOpenRow(
                        openRow === cat._id
                          ? null
                          : cat._id
                      )
                    }
                  >

                    {/* NUMBER */}

                    <td className="hidden md:table-cell p-2 sm:p-3 md:p-4 text-gray-500 whitespace-nowrap">
                      {index + 1}
                    </td>

                    {/* IMAGE */}

                    <td className="p-2 sm:p-3 md:p-4">

                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">

                        {cat.images?.[0] ? (

                          <img
                            src={cat.images[0]}
                            alt={
                              cat.title ||
                              "Category"
                            }
                            className="w-full h-full object-cover block"
                          />

                        ) : (

                          <div className="w-full h-full flex items-center justify-center text-[9px] sm:text-xs text-gray-400">
                            No Image
                          </div>

                        )}

                      </div>

                    </td>

                    {/* CATEGORY */}

                    <td className="p-2 sm:p-3 md:p-4 min-w-0">

                      <p className="font-semibold text-gray-900 truncate max-w-[140px] sm:max-w-[250px] md:max-w-[350px]">
                        {cat.title ||
                          "Untitled Category"}
                      </p>

                    </td>

                    {/* ACTIONS */}

                    <td
                      className="p-2 sm:p-3 md:p-4"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >

                      <div className="flex justify-end items-center gap-2 sm:gap-3">

                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() =>
                            handleEditClick(cat)
                          }
                          className="text-black hover:text-gray-600"
                          title="Edit category"
                        >
                          <Edit2
                            size={17}
                            className="sm:w-[18px] sm:h-[18px]"
                          />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteClick(cat)
                          }
                          className="text-red-500 hover:text-red-700"
                          title="Delete category"
                        >
                          <Trash2
                            size={17}
                            className="sm:w-[18px] sm:h-[18px]"
                          />
                        </button>

                      </div>

                    </td>

                  </tr>

                  {/* MOBILE EXPANDED ROW */}

                  {openRow === cat._id && (

                    <tr className="md:hidden bg-gray-50">

                      <td
                        colSpan={3}
                        className="p-3 text-xs space-y-2"
                      >

                        {/* NUMBER */}

                        <div className="flex justify-between items-center">

                          <span className="text-gray-500">
                            Number:
                          </span>

                          <span className="font-medium text-black">
                            {index + 1}
                          </span>

                        </div>

                        {/* CATEGORY */}

                        <div className="flex justify-between items-center gap-4">

                          <span className="text-gray-500">
                            Category:
                          </span>

                          <span className="font-medium text-black truncate max-w-[180px]">
                            {cat.title ||
                              "Untitled Category"}
                          </span>

                        </div>

                        {/* IMAGE STATUS */}

                        <div className="flex justify-between items-center">

                          <span className="text-gray-500">
                            Image:
                          </span>

                          <span className="font-medium text-black">
                            {cat.images?.length
                              ? `${cat.images.length} image${
                                  cat.images.length > 1
                                    ? "s"
                                    : ""
                                }`
                              : "No image"}
                          </span>

                        </div>

                      </td>

                    </tr>

                  )}

                </React.Fragment>

              ))}

            </tbody>

          </table>

        </div>

      )}

      {/* DELETE MODAL */}

      {showDeleteModal && (

        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">

          <div className="bg-white p-5 sm:p-6 rounded-xl w-full max-w-md">

            <h2 className="text-xl font-bold mb-4">
              Delete Category
            </h2>

            <p className="mb-6 text-gray-600">

              Delete{" "}

              <strong className="text-black">
                {selectedCategory?.title}
              </strong>{" "}

              ?

            </p>

            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCategory(null);
                }}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Delete
              </button>

            </div>

          </div>

        </div>

      )}

      {/* EDIT MODAL */}

      {showEditModal && (

        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">

          <div className="bg-white p-5 sm:p-6 rounded-xl w-full max-w-[420px] max-h-[90vh] overflow-y-auto">

            {/* MODAL HEADER */}

            <div className="flex justify-between items-center mb-5">

              <h2 className="text-xl font-bold">
                Edit Category
              </h2>

              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCategory(null);
                }}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleEditSubmit}
              className="space-y-4"
            >

              {/* TITLE */}

              <input
                type="text"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    title: e.target.value,
                  })
                }
                className="w-full border px-3 py-2.5 rounded-md outline-none focus:border-black"
                placeholder="Category title"
              />

              {/* CLOUDINARY */}

              <CldUploadWidget
                uploadPreset="EliteShop"
                onSuccess={(result) => {
                  setEditForm((prev) => ({
                    ...prev,
                    images: [
                      ...prev.images,
                      result.info.secure_url,
                    ],
                  }));
                }}
              >
                {({ open }) => (

                  <button
                    type="button"
                    onClick={() => open()}
                    className="w-full border py-2.5 rounded-md hover:bg-gray-100 transition"
                  >
                    Upload Image
                  </button>

                )}

              </CldUploadWidget>

              {/* IMAGE PREVIEW */}

              {editForm.images.length > 0 && (

                <div className="flex gap-3 flex-wrap">

                  {editForm.images.map(
                    (img, i) => (

                      <div
                        key={i}
                        className="relative w-20 h-20"
                      >

                        <img
                          src={img}
                          alt={`Category image ${
                            i + 1
                          }`}
                          className="w-full h-full object-cover rounded-md border"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeImage(i)
                          }
                          className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          <X size={12} />
                        </button>

                      </div>

                    )
                  )}

                </div>

              )}

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCategory(null);
                  }}
                  className="border px-4 py-2 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                >
                  Save
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}
