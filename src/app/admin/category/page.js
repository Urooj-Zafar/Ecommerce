"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, X, Edit2, Trash2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { CldUploadWidget } from "next-cloudinary";

export default function CategoryPage() {

  const [categories,setCategories] = useState([])
  const [loading,setLoading] = useState(false)

  const [showDeleteModal,setShowDeleteModal] = useState(false)
  const [showEditModal,setShowEditModal] = useState(false)

  const [selectedCategory,setSelectedCategory] = useState(null)

  const [editForm,setEditForm] = useState({
    title:"",
    images:[]
  })


/* ---------------- FETCH ---------------- */

const fetchCategories = async () => {
  try{
    setLoading(true)
    const res = await axios.get("/api/category")
    setCategories(res.data.Category || [])
  }catch(err){
    toast.error("Failed to load categories")
  }finally{
    setLoading(false)
  }
}

useEffect(()=>{
 fetchCategories()
},[])



/* ---------------- DELETE ---------------- */

const handleDeleteClick = (cat)=>{
  setSelectedCategory(cat)
  setShowDeleteModal(true)
}

const confirmDelete = async ()=>{
  try{

    await axios.delete(`/api/category/${selectedCategory._id}`)

    setCategories(prev => prev.filter(c=>c._id !== selectedCategory._id))

    toast.success("Category deleted")

  }catch{
    toast.error("Delete failed")
  }

  setShowDeleteModal(false)
}



/* ---------------- EDIT ---------------- */

const handleEditClick = (cat)=>{
  setSelectedCategory(cat)

  setEditForm({
    title:cat.title,
    images:cat.images || []
  })

  setShowEditModal(true)
}


const handleEditSubmit = async (e)=>{
  e.preventDefault()

  try{

    await axios.put(`/api/category/${selectedCategory._id}`,editForm)

    toast.success("Category updated")

    fetchCategories()

  }catch{
    toast.error("Update failed")
  }

  setShowEditModal(false)
}



/* ---------------- REMOVE IMAGE ---------------- */

const removeImage = (index)=>{
  setEditForm(prev => ({
    ...prev,
    images: prev.images.filter((_,i)=> i !== index)
  }))
}



return (

<div className="max-w-7xl mx-auto p-6">

{/* HEADER */}

<div className="flex justify-between items-center mb-10">

<div>
<h1 className="text-3xl font-bold">Categories</h1>
<p className="text-gray-500">Manage your store categories</p>
</div>

<Link href="/admin/category/form">
<button className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded hover:bg-gray-800">
<Plus size={18}/>
Create Category
</button>
</Link>

</div>



{/* GRID */}

{loading && <p>Loading...</p>}

{!loading && categories.length === 0 && (
<p className="text-gray-500">No categories found</p>
)}


<div className="grid md:grid-cols-3 gap-6">

{categories.map(cat => (

<div key={cat._id} className="border rounded-lg overflow-hidden shadow-sm bg-white">

{/* IMAGE */}

<div className="h-44 bg-gray-100">

{cat.images?.[0] ? (

<img
src={cat.images[0]}
className="w-full h-full object-cover"
/>

) : (

<div className="flex items-center justify-center h-full text-gray-400">
No Image
</div>

)}

</div>


{/* CONTENT */}

<div className="p-4 flex justify-between items-center">

<h2 className="font-semibold text-lg">{cat.title}</h2>

<div className="flex gap-2">

<button
onClick={()=>handleEditClick(cat)}
className="p-2 text-black rounded"
>
<Edit2 size={16}/>
</button>

<button
onClick={()=>handleDeleteClick(cat)}
className="p-2 text-red-500 rounded"
>
<Trash2 size={16} />
</button>

</div>

</div>

</div>

))}

</div>




{/* DELETE MODAL */}

{showDeleteModal && (

<div className="fixed inset-0 bg-black/60 flex items-center justify-center">

<div className="bg-white p-6 rounded w-96">

<h2 className="text-xl font-bold mb-4">Delete Category</h2>

<p className="mb-6">
Delete <strong>{selectedCategory?.title}</strong> ?
</p>

<div className="flex justify-end gap-3">

<button
onClick={()=>setShowDeleteModal(false)}
className="px-4 py-2 border rounded"
>
Cancel
</button>

<button
onClick={confirmDelete}
className="px-4 py-2 bg-black text-white rounded"
>
Delete
</button>

</div>

</div>

</div>

)}




{/* EDIT MODAL */}

{showEditModal && (

<div className="fixed inset-0 bg-black/60 flex items-center justify-center">

<div className="bg-white p-6 rounded w-[420px]">

<h2 className="text-xl font-bold mb-4">
Edit Category
</h2>


<form onSubmit={handleEditSubmit} className="space-y-4">

<input
type="text"
value={editForm.title}
onChange={(e)=>setEditForm({...editForm,title:e.target.value})}
className="w-full border px-3 py-2 rounded"
placeholder="Category title"
/>



{/* CLOUDINARY */}

<CldUploadWidget
uploadPreset="EliteShop"
onSuccess={(result)=>{

setEditForm(prev=>({
...prev,
images:[...prev.images,result.info.secure_url]
}))

}}
>

{({open}) => (

<button
type="button"
onClick={()=>open()}
className="w-full border py-2 rounded hover:bg-gray-100"
>
Upload Image
</button>

)}

</CldUploadWidget>




{/* IMAGE PREVIEW */}

<div className="flex gap-3 flex-wrap">

{editForm.images.map((img,i)=> (

<div key={i} className="relative w-20 h-20">

<img
src={img}
className="w-full h-full object-cover rounded"
/>

<button
type="button"
onClick={()=>removeImage(i)}
className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center"
>
<X size={12}/>
</button>

</div>

))}

</div>



<div className="flex justify-end gap-3">

<button
type="button"
onClick={()=>setShowEditModal(false)}
className="border px-4 py-2 rounded"
>
Cancel
</button>

<button
type="submit"
className="bg-black text-white px-4 py-2 rounded"
>
Save
</button>

</div>

</form>

</div>

</div>

)}

</div>

)
}