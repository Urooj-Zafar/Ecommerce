"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import axios from "axios";
import toast from "react-hot-toast";
import { X } from "lucide-react";

export default function UpdateProductForm() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  // Categories
  const [categories, setCategories] = useState([]);

  // Product form
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    price: "",
    category: "",
    stock: "",
  });

  // Images
  const [tempImages, setTempImages] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // --------------------------------
  // Fetch categories
  // --------------------------------
  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/category");

      const categoryData = res.data?.Category;

      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (error) {
      console.error("CATEGORY FETCH ERROR:", error);
      setCategories([]);
      toast.error("Failed to load categories");
    }
  };

  // --------------------------------
  // Fetch product
  // --------------------------------
  const fetchProduct = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const res = await axios.get(`/api/products/${id}`);

      /*
        Your API may return either:

        {
          single: {...}
        }

        OR directly:

        {
          _id: "...",
          title: "..."
        }

        This handles both.
      */
      const product = res.data?.single || res.data?.product || res.data;

      if (!product || !product._id) {
        toast.error("Product not found");
        return;
      }

      setFormData({
        title: product.title || "",
        desc: product.desc || "",
        price: product.price ?? "",
        category: product.category?._id || product.category || "",
        stock: product.stock ?? "",
      });

      setTempImages(
        Array.isArray(product.images) ? product.images : []
      );
    } catch (error) {
      console.error("PRODUCT FETCH ERROR:", error);

      toast.error(
        error.response?.data?.message || "Failed to load product"
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Load product + categories
  // --------------------------------
  useEffect(() => {
    if (!id) return;

    fetchProduct();
    fetchCategories();
  }, [id]);

  // --------------------------------
  // Input change
  // --------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------
  // Update product
  // --------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id) {
      toast.error("Product ID is missing");
      return;
    }

    try {
      setUpdating(true);

      const res = await axios.put(`/api/products/${id}`, {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        images: tempImages,
      });

      if (res.data?.success) {
        toast.success("Product updated successfully");

        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(
          res.data?.message || "Product update failed"
        );
      }
    } catch (error) {
      console.error("UPDATE PRODUCT ERROR:", error);

      toast.error(
        error.response?.data?.message || "Product update failed"
      );
    } finally {
      setUpdating(false);
    }
  };

  // --------------------------------
  // Delete image
  // --------------------------------
  const handleRemoveImage = (index) => {
    setTempImages((prev) =>
      prev.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  // --------------------------------
  // Loading
  // --------------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg font-medium">
          Loading product...
        </p>
      </div>
    );
  }

  // --------------------------------
  // UI
  // --------------------------------
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl p-6 md:p-10 bg-white border border-gray-300 rounded-t-3xl rounded-b-xl shadow-lg">

        <h2 className="font-extrabold text-3xl md:text-4xl mb-8 text-center">
          Update Product
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 w-full items-center"
        >

          {/* Product Name */}
          <input
            type="text"
            name="title"
            placeholder="Product Name"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full max-w-md px-3 py-2 border-b-2 border-black placeholder-black focus:outline-none"
          />

          {/* Stock */}
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            required
            className="w-full max-w-md px-3 py-2 border-b-2 border-black placeholder-black focus:outline-none"
          />

          {/* Category */}
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full max-w-md px-3 py-2 border border-black rounded-md bg-white focus:outline-none"
          >
            <option value="">
              Select Category
            </option>

            {(categories || []).map((category) => (
              <option
                key={category._id}
                value={category._id}
              >
                {category.title}
              </option>
            ))}
          </select>

          {/* Price */}
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            required
            className="w-full max-w-md px-3 py-2 border-b-2 border-black placeholder-black focus:outline-none"
          />

          {/* Description */}
          <textarea
            name="desc"
            placeholder="Description"
            value={formData.desc}
            onChange={handleChange}
            required
            rows={4}
            className="w-full max-w-md px-3 py-2 border-b-2 border-black placeholder-black focus:outline-none resize-none"
          />

          {/* Cloudinary Upload */}
          <CldUploadWidget
            uploadPreset="EliteShop"
            options={{
              multiple: true,
            }}
            onSuccess={(result) => {
              if (
                result?.event === "success" &&
                result?.info?.secure_url
              ) {
                setTempImages((prev) => [
                  ...prev,
                  result.info.secure_url,
                ]);

                toast.success("Image uploaded");
              }
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="w-full max-w-md py-4 border-2 border-dashed border-black rounded-md text-black hover:bg-gray-50 transition"
              >
                Upload Images
              </button>
            )}
          </CldUploadWidget>

          {/* Images Preview */}
          {Array.isArray(tempImages) &&
            tempImages.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3 w-full max-w-md">
                {tempImages.map((img, index) => (
                  <div
                    key={`${img}-${index}`}
                    className="relative w-24 h-24 border border-black rounded-md overflow-hidden"
                  >
                    <img
                      src={img}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveImage(index)
                      }
                      className="absolute top-1 right-1 bg-white text-red-600 rounded-full p-1 hover:bg-red-100"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

          {/* Update Button */}
          <button
            type="submit"
            disabled={updating}
            className="w-full max-w-md py-3 mt-6 bg-black text-white font-bold rounded-md hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating
              ? "Updating..."
              : "Update Product"}
          </button>

        </form>
      </div>
    </div>
  );
}