"use client";
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { CldUploadWidget } from 'next-cloudinary';
import { X } from 'lucide-react';

const page = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    images: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.images.length) {
      return toast.error("Upload category image");
    }

    try {
      const res = await axios.post("/api/category", formData);

      if (res.status === 201) {
        toast.success("Category Created Successfully");
        setFormData({ title: "", images: [] });
        setTimeout(() => router.push("/admin/category"), 1000);
      }

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className='w-full h-[70vh] flex items-center justify-center'>
      <form onSubmit={handleSubmit} className='w-1/3 bg-white p-5 rounded-lg shadow-lg'>

        <h1 className='text-2xl font-bold mb-4'>Create Category</h1>

        {/* Title */}
        <div className='mb-4'>
          <label className='block text-sm font-medium'>Category Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className='mt-1 block w-full px-3 py-2 border rounded'
          />
        </div>

        {/* Cloudinary Upload */}
        <div className='mb-4'>

          <label className='block text-sm font-medium'>Upload Image</label>

          <CldUploadWidget
            uploadPreset="EliteShop"
            options={{ multiple: false }}
            onSuccess={(result) => {

              if (result?.info?.secure_url) {

                setFormData(prev => ({
                  ...prev,
                  images: [result.info.secure_url] // only ONE image
                }));

                toast.success("Image uploaded");

              }

            }}
          >

            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className='mt-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-700'
              >
                Upload Image
              </button>
            )}

          </CldUploadWidget>

          {/* Preview */}
          {formData.images.length > 0 && (

            <div className='mt-3 relative w-24 h-24 border rounded overflow-hidden'>

              <img
                src={formData.images[0]}
                className='w-full h-full object-cover'
              />

              <button
                type='button'
                onClick={() => setFormData(prev => ({ ...prev, images: [] }))}
                className='absolute top-1 right-1 bg-black text-white rounded-full p-1'
              >
                <X size={12} />
              </button>

            </div>

          )}

        </div>

        {/* Submit */}
        <button
          type="submit"
          className='w-full bg-black text-white py-2 rounded hover:bg-gray-700'
        >
          Create Category
        </button>

      </form>
    </div>
  );
};

export default page;