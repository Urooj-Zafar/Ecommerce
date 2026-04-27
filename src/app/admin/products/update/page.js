"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import axios from "axios";
import toast from "react-hot-toast";
import { X } from "lucide-react";

export default function page({ product, categories }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: product?.title || "",
    desc: product?.desc || "",
    price: product?.price || "",
    category: product?.category?._id || "",
    stock: product?.stock || ""
  });

  const [tempImages, setTempImages] = useState(product?.images || []);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.put(`/api/products/${product._id}`, {
        ...formData,
        images: tempImages
      });
      if (res.data.success) {
        toast.success("Product updated successfully");
        router.push("/admin/products");
      } else toast.error("Update failed");
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl p-10 bg-white border border-gray-300 rounded-t-3xl rounded-b-xl shadow-lg flex flex-col items-center">
        <h2 className="font-extrabold text-4xl mb-8">Update Product</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
          <input
            type="text"
            name="title"
            placeholder="Product Name"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full max-w-md px-3 py-2 border-b-2 border-black placeholder-black focus:outline-none focus:border-gray-700"
          />

          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={formData.stock}
            onChange={handleChange}
            required
            className="w-full max-w-md px-3 py-2 border-b-2 border-black placeholder-black focus:outline-none focus:border-gray-700"
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full max-w-md px-3 py-2 border border-black rounded-md bg-white"
          >
            <option value="">Select category</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.title}</option>
            ))}
          </select>

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
            className="w-full max-w-md px-3 py-2 border-b-2 border-black placeholder-black focus:outline-none focus:border-gray-700"
          />

          <textarea
            name="desc"
            placeholder="Description"
            value={formData.desc}
            onChange={handleChange}
            required
            rows={4}
            className="w-full max-w-md px-3 py-2 border-b-2 border-black placeholder-black focus:outline-none focus:border-gray-700"
          />

          {/* Images */}
          <CldUploadWidget
            uploadPreset="cartify"
            onSuccess={(result) => {
              if (result.info?.secure_url && result.event === "success") {
                setTempImages(prev => [...prev, result.info.secure_url]);
              }
            }}
            options={{ multiple: true }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={open}
                className="w-full max-w-md py-4 border-2 border-dashed border-black rounded-md text-black hover:bg-gray-50 transition"
              >
                Upload Images
              </button>
            )}
          </CldUploadWidget>

          {tempImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {tempImages.map((img, i) => (
                <div key={i} className="relative w-24 h-24 border border-black rounded-md overflow-hidden">
                  <img src={img} alt={`Uploaded ${i}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setTempImages(prev => prev.filter((_, index) => index !== i))}
                    className="absolute top-1 right-1 text-red-600 font-bold"
                  >
                    <X />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full max-w-md py-3 mt-6 bg-black text-white font-bold rounded-md hover:bg-gray-800 transition"
          >
            {loading ? "Updating..." : "Update Product"}
          </button>
        </form>
      </div>
    </div>
  );
}