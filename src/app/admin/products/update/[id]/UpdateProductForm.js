"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import axios from "axios";
import toast from "react-hot-toast";
import { X } from "lucide-react";

export default function UpdateProductForm() {

  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [option, setOption] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    price: "",
    category: "",
    stock: "",
    sizes: [],
    colors: []
  });

  const [tempImages, setTempImages] = useState([]);
  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const catFetch = async () => {
    try {
      const res = await axios.get("/api/category");
      setOption(res.data.Category || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch categories.");
    }
  };

  useEffect(() => {

    const fetchProduct = async () => {

      try {

        const res = await axios.get(
          `/api/products/${id}`
        );

        const product =
          res.data.single || res.data;

        setFormData({
          title: product.title || "",
          desc: product.desc || "",
          price: product.price ?? "",
          category:
            product.category?._id ||
            product.category ||
            "",
          stock: product.stock ?? "",
          sizes: product.sizes || [],
          colors: product.colors || []
        });

        setTempImages(product.images || []);

        setLoading(false);

      } catch (error) {

        console.log(error);

        toast.error("Failed to load product");

        setLoading(false);
      }

    };

    catFetch();

    if (id) {
      fetchProduct();
    }

  }, [id]);

  const handleChange = (e) => {

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));

  };

  const addSize = () => {

    const size = sizeInput.trim();

    if (!size) return;

    if (formData.sizes.includes(size)) {
      toast.error("Size already added");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, size]
    }));

    setSizeInput("");
  };

  const removeSize = (size) => {

    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter(
        (item) => item !== size
      )
    }));

  };

  const addColor = () => {

    const color = colorInput.trim();

    if (!color) return;

    if (formData.colors.includes(color)) {
      toast.error("Color already added");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      colors: [...prev.colors, color]
    }));

    setColorInput("");
  };

  const removeColor = (color) => {

    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter(
        (item) => item !== color
      )
    }));

  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!id) {
    toast.error("Product ID is missing");
    return;
  }

  setUpdating(true);

  try {
    const res = await axios.put(`/api/products/${id}`, {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      images: tempImages,
      sizes: formData.sizes,
      colors: formData.colors,
    });

    // Axios considers 2xx responses successful.
    // Don't depend on res.data.success unless your API actually returns it.
    if (res.status >= 200 && res.status < 300) {
      toast.success("Product updated successfully");

      router.push("/admin/products");
      router.refresh();

      return;
    }

    toast.error(res.data?.message || "Update failed");

  } catch (error) {
    console.error(
      "UPDATE PRODUCT ERROR:",
      error.response?.data || error
    );

    toast.error(
      error.response?.data?.message ||
      "Update failed"
    );
  } finally {
    setUpdating(false);
  }
};

  if (loading) {
    return (
      <p className="text-center mt-10">
        Loading...
      </p>
    );
  }

  return (

    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5">

      <div className="w-full max-w-2xl p-10 bg-white border border-gray-300 rounded-t-3xl rounded-b-xl shadow-lg flex flex-col items-center">

        <h2 className="font-extrabold text-4xl mb-8">
          Update Product
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 w-full"
        >

          <input
            type="text"
            name="title"
            placeholder="Product Name"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border-b-2 border-black"
          />

          <input
            type="number"
            name="stock"
            placeholder="Stock"
            min="0"
            value={formData.stock}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border-b-2 border-black"
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-black"
          >

            <option value="">
              Select Category
            </option>

            {option.map((v) => (

              <option
                key={v._id}
                value={v._id}
              >
                {v.title}
              </option>

            ))}

          </select>

          <input
            type="number"
            name="price"
            placeholder="Price"
            min="0"
            value={formData.price}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border-b-2 border-black"
          />

          <textarea
            name="desc"
            placeholder="Description"
            value={formData.desc}
            onChange={handleChange}
            rows={4}
            required
            className="w-full px-3 py-2 border-b-2 border-black"
          />

          <div className="space-y-3">

            <label className="font-semibold">
              Sizes
            </label>

            <div className="flex gap-2">

              <input
                type="text"
                value={sizeInput}
                onChange={(e) =>
                  setSizeInput(e.target.value)
                }
                onKeyDown={(e) => {

                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSize();
                  }

                }}
                placeholder="e.g. S, M, L, XL"
                className="flex-1 p-3 border border-black rounded"
              />

              <button
                type="button"
                onClick={addSize}
                className="px-5 bg-black text-white rounded"
              >
                Add
              </button>

            </div>

            {formData.sizes.length > 0 && (

              <div className="flex flex-wrap gap-2">

                {formData.sizes.map((size) => (

                  <span
                    key={size}
                    className="flex items-center gap-2 border border-black px-3 py-1 rounded-full"
                  >

                    {size}

                    <button
                      type="button"
                      onClick={() =>
                        removeSize(size)
                      }
                    >
                      <X size={14} />
                    </button>

                  </span>

                ))}

              </div>

            )}

          </div>

          <div className="space-y-3">

            <label className="font-semibold">
              Colors
            </label>

            <div className="flex gap-2">

              <input
                type="text"
                value={colorInput}
                onChange={(e) =>
                  setColorInput(e.target.value)
                }
                onKeyDown={(e) => {

                  if (e.key === "Enter") {
                    e.preventDefault();
                    addColor();
                  }

                }}
                placeholder="e.g. Black, White, Red"
                className="flex-1 p-3 border border-black rounded"
              />

              <button
                type="button"
                onClick={addColor}
                className="px-5 bg-black text-white rounded"
              >
                Add
              </button>

            </div>

            {formData.colors.length > 0 && (

              <div className="flex flex-wrap gap-2">

                {formData.colors.map((color) => (

                  <span
                    key={color}
                    className="flex items-center gap-2 border border-black px-3 py-1 rounded-full"
                  >

                    {color}

                    <button
                      type="button"
                      onClick={() =>
                        removeColor(color)
                      }
                    >
                      <X size={14} />
                    </button>

                  </span>

                ))}

              </div>

            )}

          </div>

          <CldUploadWidget
            uploadPreset="EliteShop"
            options={{ multiple: true }}
            onSuccess={(result) => {

              if (
                result.event === "success" &&
                result.info?.secure_url
              ) {

                setTempImages((prev) => [
                  ...prev,
                  result.info.secure_url
                ]);

              }

            }}
          >

            {({ open }) => (

              <button
                type="button"
                onClick={open}
                className="w-full py-4 border-2 border-dashed border-black rounded-md"
              >
                Upload Images
              </button>

            )}

          </CldUploadWidget>

          {tempImages.length > 0 && (

            <div className="flex flex-wrap gap-3 mt-3">

              {tempImages.map((img, i) => (

                <div
                  key={i}
                  className="relative w-24 h-24 border border-black rounded-md overflow-hidden"
                >

                  <img
                    src={img}
                    alt={`Product ${i + 1}`}
                    className="w-full h-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setTempImages((prev) =>
                        prev.filter(
                          (_, index) =>
                            index !== i
                        )
                      )
                    }
                    className="absolute top-1 right-1 text-red-600 bg-white rounded-full p-1"
                  >
                    <X size={18} />
                  </button>

                </div>

              ))}

            </div>

          )}

          <button
            type="submit"
            disabled={updating}
            className="w-full py-3 mt-6 bg-black text-white rounded-md disabled:opacity-50"
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