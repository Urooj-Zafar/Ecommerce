"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function BuyNow(){

const router = useRouter()

const [product,setProduct] = useState(null)
const [qty,setQty] = useState(1)

const [form,setForm] = useState({
name:"",
email:"",
address:"",
city:"",
paymentMethod:"COD"
})

useEffect(()=>{

const buyNow = JSON.parse(localStorage.getItem("buyNow"))

if(!buyNow){
toast.error("No product selected")
router.push("/")
return
}

setProduct(buyNow)
setQty(buyNow.qty || 1)

},[router])


const handleChange = (e)=>{
setForm({...form,[e.target.name]:e.target.value})
}


const increment = ()=>{

if(!product) return

if(qty + 1 > product.stock){
toast.error("Stock limit reached")
return
}

setQty(qty + 1)

}


const decrement = ()=>{

if(qty <= 1) return
setQty(qty - 1)

}


const proceedCheckout = ()=>{

if(!form.name || !form.email || !form.address || !form.city){
toast.error("Fill all fields")
return
}

localStorage.setItem("checkoutData",JSON.stringify({
product,
qty,
form
}))

router.push("/Checkout")

}


if(!product){
return(
<div className="flex justify-center items-center min-h-screen">
Loading...
</div>
)
}

const total = (product?.price || 0) * qty

return(

<div className="min-h-screen flex justify-center items-center bg-gray-50 p-8">

<div className="max-w-5xl w-full bg-white border rounded-xl p-8 grid md:grid-cols-2 gap-8">

{/* PRODUCT */}

<div>

<img
src={product?.images?.[0]}
alt={product.title}
className="w-full rounded-lg border"
/>

<h2 className="text-xl font-bold mt-4">
{product.title}
</h2>

<p className="text-gray-600">
{product.desc}
</p>

<p className="mt-2 font-bold">
${product.price}
</p>

{product.selectedSize && (
<p>Size: {product.selectedSize}</p>
)}

{product.selectedColor && (
<p>Color: {product.selectedColor}</p>
)}

<div className="flex items-center gap-3 mt-4">

<button
onClick={decrement}
className="px-3 py-1 border rounded"
>
-
</button>

<span>{qty}</span>

<button
onClick={increment}
className="px-3 py-1 border rounded"
>
+
</button>

</div>

<p className="text-xl font-bold mt-4">
Total: ${total}
</p>

</div>


{/* SHIPPING FORM */}

<div className="flex flex-col gap-4">

<h2 className="text-xl font-bold">
Shipping Information
</h2>

<input
name="name"
placeholder="Full Name"
className="border p-3 rounded"
onChange={handleChange}
/>

<input
name="email"
placeholder="Email"
className="border p-3 rounded"
onChange={handleChange}
/>

<input
name="address"
placeholder="Address"
className="border p-3 rounded"
onChange={handleChange}
/>

<input
name="city"
placeholder="City"
className="border p-3 rounded"
onChange={handleChange}
/>

<select
name="paymentMethod"
className="border p-3 rounded"
onChange={handleChange}
>

<option value="COD">
Cash on Delivery
</option>

<option value="Card">
Card
</option>

</select>

<button
onClick={proceedCheckout}
className="bg-black text-white py-3 rounded mt-4"
>

Continue to Checkout

</button>

</div>

</div>

</div>

)

}