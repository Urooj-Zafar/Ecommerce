"use client"
import axios from 'axios';
import { PackagePlus, ShoppingCart, X } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

const page = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ title:"", desc:"", price:"", category:"", stock:"" });
  const [option, setOption] = useState([]);
  const [tempImages, setTempImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories
  const catFetch = async () => {
    try {
      const res = await axios.get("/api/category");
      setOption(res.data.Category || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch categories.");
    } 
  };
  
  useEffect(() => { catFetch(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("/api/products", { ...formData, images: tempImages });
      if(res?.data.success){
        toast.success("Submitted successfully");
        setTimeout(() => router.push("/admin/products"), 1000);
      } else toast.error("Submission failed");
    } catch { toast.error("Submission failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-2xl p-10 bg-white border border-black/20 shadow-lg rounded-t-3xl rounded-b-xl flex flex-col items-center">
        <h2 className="font-extrabold text-4xl mb-10 flex items-center gap-4 text-black">
          <PackagePlus size={35}/> Add Product <ShoppingCart size={35}/>
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
          {/* Product Name */}
          <input
            className="w-full p-3 border-b-2 border-black placeholder-black text-black focus:border-gray-700 focus:ring-0 transition duration-300 rounded-t-md"
            type="text" name="title" placeholder="Product Name" onChange={handleChange} required
          />

          {/* Stock */}
          <input
            className="w-full p-3 border-b-2 border-black placeholder-black text-black focus:border-gray-700 focus:ring-0 transition duration-300"
            type="number" name="stock" placeholder="Stock" onChange={handleChange} required
          />

          {/* Category */}
          <select
            className="w-full p-3 border border-black rounded bg-white text-black focus:outline-none focus:ring-1 focus:ring-black transition duration-300"
            name="category" onChange={handleChange} required
          >
            <option value="">Select Category</option>
            {option?.map((v) => <option key={v._id} value={v._id}>{v.title}</option>)}
          </select>

          {/* Price */}
          <input
            className="w-full p-3 border-b-2 border-black placeholder-black text-black focus:border-gray-700 transition duration-300"
            type="number" name="price" placeholder="Price" onChange={handleChange} required
          />

          {/* Description */}
          <textarea
            className="w-full p-3 border-b-2 border-black placeholder-black text-black focus:border-gray-700 transition duration-300 rounded-b-md"
            name="desc" placeholder="Description" onChange={handleChange} rows={4} required
          />

          {/* Upload Images */}
          <CldUploadWidget
            uploadPreset="EliteShop"
            onSuccess={(results) => {
              if(results.info?.secure_url && results.event === "success")
                setTempImages(prev => [...prev, results.info.secure_url]);
            }}
            options={{ multiple: true }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="w-full border-2 border-black rounded p-5 text-black hover:bg-black hover:text-white transition duration-300 flex flex-col items-center justify-center gap-2"
              >
                <i className="fa fa-cloud-upload-alt text-3xl"></i>
                Upload Images
              </button>
            )}
          </CldUploadWidget>

          {/* Preview uploaded images */}
          {tempImages.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4">
              {tempImages.map((img, i) => (
                <div key={i} className="relative w-[120px] h-[120px] border border-black rounded overflow-hidden">
                  <img src={img} alt={`Uploaded ${i}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setTempImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 text-black bg-white rounded-full p-1 hover:bg-gray-200 transition"
                  >
                    <X/>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-3 font-bold text-white bg-black rounded-lg shadow hover:bg-gray-900 transition duration-300"
          >
            {loading ? "Submitting..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default page;