"use client"

import axios from "axios";
import { PackagePlus, ShoppingCart, X } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Page = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    price: "",
    category: "",
    stock: "",
    sizes: [],
    colors: []
  });

  const [option, setOption] = useState([]);
  const [tempImages, setTempImages] = useState([]);
  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [loading, setLoading] = useState(false);

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
    catFetch();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
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
      sizes: prev.sizes.filter((item) => item !== size)
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
      colors: prev.colors.filter((item) => item !== color)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post("/api/products", {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        images: tempImages
      });

      if (res?.data.success) {
        toast.success("Product added successfully");

        setTimeout(() => {
          router.push("/admin/products");
        }, 1000);
      } else {
        toast.error(res.data.message || "Submission failed");
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Submission failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-5">

      <div className="w-full max-w-2xl p-10 bg-white border border-black/20 shadow-lg rounded-t-3xl rounded-b-xl flex flex-col items-center">

        <h2 className="font-extrabold text-4xl mb-10 flex items-center gap-4 text-black">
          <PackagePlus size={35} />
          Add Product
          <ShoppingCart size={35} />
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 w-full"
        >

          <input
            className="w-full p-3 border-b-2 border-black placeholder-black text-black focus:border-gray-700 focus:ring-0 transition rounded-t-md"
            type="text"
            name="title"
            placeholder="Product Name"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <input
            className="w-full p-3 border-b-2 border-black placeholder-black text-black focus:border-gray-700 focus:ring-0 transition"
            type="number"
            name="stock"
            placeholder="Stock"
            min="0"
            value={formData.stock}
            onChange={handleChange}
            required
          />

          <select
            className="w-full p-3 border border-black rounded bg-white text-black focus:outline-none focus:ring-1 focus:ring-black transition"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>

            {option.map((v) => (
              <option key={v._id} value={v._id}>
                {v.title}
              </option>
            ))}
          </select>

          <input
            className="w-full p-3 border-b-2 border-black placeholder-black text-black focus:border-gray-700 transition"
            type="number"
            name="price"
            placeholder="Price"
            min="0"
            value={formData.price}
            onChange={handleChange}
            required
          />

          <textarea
            className="w-full p-3 border-b-2 border-black placeholder-black text-black focus:border-gray-700 transition rounded-b-md"
            name="desc"
            placeholder="Description"
            value={formData.desc}
            onChange={handleChange}
            rows={4}
            required
          />

          <div className="space-y-3">

            <label className="font-semibold">
              Sizes
            </label>

            <div className="flex gap-2">

              <input
                type="text"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
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
                className="px-5 bg-black text-white rounded hover:bg-gray-800"
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
                      onClick={() => removeSize(size)}
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
                onChange={(e) => setColorInput(e.target.value)}
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
                className="px-5 bg-black text-white rounded hover:bg-gray-800"
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
                      onClick={() => removeColor(color)}
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
            onSuccess={(results) => {
              if (
                results.info?.secure_url &&
                results.event === "success"
              ) {
                setTempImages((prev) => [
                  ...prev,
                  results.info.secure_url
                ]);
              }
            }}
            options={{ multiple: true }}
          >
            {({ open }) => (

              <button
                type="button"
                onClick={() => open()}
                className="w-full border-2 border-black rounded p-5 text-black hover:bg-black hover:text-white transition flex flex-col items-center justify-center gap-2"
              >
                <span className="text-3xl">☁</span>
                Upload Images
              </button>

            )}
          </CldUploadWidget>

          {tempImages.length > 0 && (

            <div className="flex flex-wrap gap-4 mt-4">

              {tempImages.map((img, i) => (

                <div
                  key={i}
                  className="relative w-[120px] h-[120px] border border-black rounded overflow-hidden"
                >

                  <img
                    src={img}
                    alt={`Uploaded ${i + 1}`}
                    className="w-full h-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setTempImages((prev) =>
                        prev.filter((_, idx) => idx !== i)
                      )
                    }
                    className="absolute top-1 right-1 text-black bg-white rounded-full p-1 hover:bg-gray-200 transition"
                  >
                    <X size={18} />
                  </button>

                </div>

              ))}

            </div>

          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-3 font-bold text-white bg-black rounded-lg shadow hover:bg-gray-900 transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Add Product"}
          </button>

        </form>

      </div>

    </div>
  );
};

export default Page;