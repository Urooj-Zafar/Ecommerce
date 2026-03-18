"use client"

import { useEffect,useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function Checkout(){

const router = useRouter()

const [data,setData] = useState(null)

useEffect(()=>{

const checkout = JSON.parse(localStorage.getItem("checkoutData"))

if(!checkout){
router.push("/")
return
}

setData(checkout)

},[])


const confirmOrder = async()=>{

try{

const {product,qty,form} = data

await axios.post("/api/orders",{

customer:{
name:form.name,
email:form.email,
address:form.address,
city:form.city
},

items:[
{
product:product._id,
size:product.selectedSize,
color:product.selectedColor,
qty
}
],

paymentMethod:form.paymentMethod

})

toast.success("Order placed successfully")

localStorage.removeItem("buyNow")
localStorage.removeItem("checkoutData")

router.push("/")

}catch(err){

toast.error("Order failed")

}

}

if(!data) return null

const {product,qty,form} = data

const total = product.price * qty

return(

<div className="max-w-4xl mx-auto p-10">

<h1 className="text-2xl font-bold mb-6">
Order Review
</h1>

<div className="border p-6 rounded-lg">

<h2 className="font-bold text-lg mb-2">
Customer
</h2>

<p>{form.name}</p>
<p>{form.email}</p>
<p>{form.address}</p>
<p>{form.city}</p>

<hr className="my-4"/>

<h2 className="font-bold text-lg mb-2">
Product
</h2>

<p>{product.title}</p>

<p>Size: {product.selectedSize}</p>
<p>Color: {product.selectedColor}</p>

<p>Quantity: {qty}</p>

<p className="font-bold text-xl mt-4">
Total: ${total}
</p>

<button
onClick={confirmOrder}
className="bg-black text-white px-6 py-3 mt-6 rounded"
>

Confirm Order

</button>

</div>

</div>

)

}