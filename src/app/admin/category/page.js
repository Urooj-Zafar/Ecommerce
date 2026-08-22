"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, X, Edit2, Trash2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { CldUploadWidget } from "next-cloudinary";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [editForm, setEditForm] = useState({
    title: "",
    images: [],
  });

  /* ---------------- FETCH ---------------- */

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/category");

      setCategories(res.data.Category || []);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ---------------- DELETE ---------------- */

  const handleDeleteClick = (cat) => {
    setSelectedCategory(cat);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/category/${selectedCategory._id}`);

      setCategories((prev) =>
        prev.filter((c) => c._id !== selectedCategory._id)
      );

      toast.success("Category deleted");
    } catch {
      toast.error("Delete failed");
    }

    setShowDeleteModal(false);
    setSelectedCategory(null);
  };

  /* ---------------- EDIT ---------------- */

  const handleEditClick = (cat) => {
    setSelectedCategory(cat);

    setEditForm({
      title: cat.title,
      images: cat.images || [],
    });

    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `/api/category/${selectedCategory._id}`,
        editForm
      );

      toast.success("Category updated");

      fetchCategories();
    } catch {
      toast.error("Update failed");
    }

    setShowEditModal(false);
  };

  /* ---------------- REMOVE IMAGE ---------------- */

  const removeImage = (index) => {
    setEditForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">

        <div>
          <h1 className="text-3xl font-bold">Categories</h1>

          <p className="text-gray-500 mt-1">
            Manage your store categories
          </p>
        </div>

        <Link href="/admin/category/form">
          <button className="flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded hover:bg-gray-800 transition">
            <Plus size={18} />
            Create Category
          </button>
        </Link>

      </div>

      {/* TABLE */}

      {loading && (
        <div className="border rounded-lg p-8 text-center text-gray-500">
          Loading categories...
        </div>
      )}

      {!loading && categories.length === 0 && (
        <div className="border rounded-lg p-8 text-center text-gray-500">
          No categories found
        </div>
      )}

      {!loading && categories.length > 0 && (
        <div className=" overflow-hidden bg-white shadow-sm">

          {/* TABLE WRAPPER */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[650px]">

              {/* TABLE HEADER */}

              <thead className="bg-gray-50 border-b">

                <tr>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    #
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Image
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Category
                  </th>


                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    Actions
                  </th>

                </tr>

              </thead>

              {/* TABLE BODY */}

              <tbody className="divide-y">

                {categories.map((cat, index) => (

                  <tr
                    key={cat._id}
                    className="hover:bg-gray-50 transition"
                  >

                    {/* NUMBER */}

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>

                    {/* IMAGE */}

                    <td className="px-6 py-4">

                      <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100">

                        {cat.images?.[0] ? (

                          <img
                            src={cat.images[0]}
                            alt={cat.title}
                            className="w-full h-full object-cover"
                          />

                        ) : (

                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            No Image
                          </div>

                        )}

                      </div>

                    </td>

                    {/* CATEGORY */}

                    <td className="px-6 py-4">

                      <p className="font-semibold text-gray-900">
                        {cat.title}
                      </p>

                    </td>


                    {/* ACTIONS */}

                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() => handleEditClick(cat)}
                          className="p-2 border rounded-md hover:bg-gray-100 transition"
                          title="Edit category"
                        >
                          <Edit2 size={17} />
                        </button>

                        <button
                          onClick={() => handleDeleteClick(cat)}
                          className="p-2 border border-red-200 text-red-500 rounded-md hover:bg-red-50 transition"
                          title="Delete category"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>
      )}

      {/* DELETE MODAL */}

      {showDeleteModal && (

        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">

          <div className="bg-white p-6 rounded-lg w-full max-w-md">

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
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCategory(null);
                }}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
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

          <div className="bg-white p-6 rounded-lg w-full max-w-[420px] max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center mb-5">

              <h2 className="text-xl font-bold">
                Edit Category
              </h2>

              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X size={20} />
              </button>

            </div>

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

              <div className="flex gap-3 flex-wrap">

                {editForm.images.map((img, i) => (

                  <div
                    key={i}
                    className="relative w-20 h-20"
                  >

                    <img
                      src={img}
                      alt={`Category image ${i + 1}`}
                      className="w-full h-full object-cover rounded-md border"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>

                  </div>

                ))}

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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