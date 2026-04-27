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

  const catFetch = async () => {
      try {
        const res = await axios.get("/api/category");
        setOption(res.data.Category || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch categories.");
      } 
    };

  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    price: "",
    category: "",
    stock: ""
  });

  const [tempImages, setTempImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);

        const product = res.data;

        setFormData({
          title: product.title || "",
          desc: product.desc || "",
          price: product.price || "",
          category: product.category?._id || "",
          stock: product.stock || ""
        });

        setTempImages(product.images || []);

        setLoading(false);

      } catch (error) {
        console.log(error);
        toast.error("Failed to load product");
      }
    };

    catFetch();
    if (id) fetchProduct();

  }, [id]);

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {

      const res = await axios.put(`/api/products/${id}`, {
        ...formData,
        images: tempImages
      });

        toast.success("Product updated successfully");
        router.push("/admin/products");


    } catch (error) {
      toast.error("Update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl p-10 bg-white border border-gray-300 rounded-t-3xl rounded-b-xl shadow-lg flex flex-col items-center">

        <h2 className="font-extrabold text-4xl mb-8">Update Product</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full justify-center items-center">

          <input
            type="text"
            name="title"
            placeholder="Product Name"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full max-w-md px-3 py-2 border-b-2 border-black"
          />

          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={formData.stock}
            onChange={handleChange}
            required
            className="w-full max-w-md px-3 py-2 border-b-2 border-black"
          />

          <select
            className="w-full max-w-md px-3 py-2 border border-black"
            name="category" onChange={handleChange} required
            value={formData.category}
          >
            <option value="">Select Category</option>
            {option?.map((v) => <option key={v._id} value={v._id}>{v.title}</option>)}
          </select>

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
            className="w-full max-w-md px-3 py-2 border-b-2 border-black"
          />

          <textarea
            name="desc"
            placeholder="Description"
            value={formData.desc}
            onChange={handleChange}
            rows={4}
            required
            className="w-full max-w-md px-3 py-2 border-b-2 border-black"
          />

          <CldUploadWidget
            uploadPreset="EliteShop"
            options={{ multiple: true }}
            onSuccess={(result) => {
              if (result.event === "success" && result.info?.secure_url) {
                setTempImages(prev => [...prev, result.info.secure_url]);
              }
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={open}
                className="w-full max-w-md py-4 border-2 border-dashed border-black rounded-md"
              >
                Upload Images
              </button>
            )}
          </CldUploadWidget>

          {tempImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {tempImages.map((img, i) => (
                <div key={i} className="relative w-24 h-24 border border-black rounded-md overflow-hidden">
                  <img src={img} className="w-full h-full object-cover" />

                  <button
                    type="button"
                    onClick={() => setTempImages(prev => prev.filter((_, index) => index !== i))}
                    className="absolute top-1 right-1 text-red-600"
                  >
                    <X size={18}/>
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={updating}
            className="w-full max-w-md py-3 mt-6 bg-black text-white rounded-md"
          >
            {updating ? "Updating..." : "Update Product"}
          </button>

        </form>
      </div>
    </div>
  );
}