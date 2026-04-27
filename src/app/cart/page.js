"use client"

import { useState, useEffect } from "react"
import { X, Plus, Minus } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function CartPage(){

  const [cart,setCart] = useState([])
  const router = useRouter()

  useEffect(()=>{
    const savedCart = JSON.parse(localStorage.getItem("cart")) || []
    setCart(savedCart)
  },[])

  const updateCart = (index, qty) => {
    if(qty < 1) return
    const newCart = [...cart]
    newCart[index].qty = qty
    setCart(newCart)
    localStorage.setItem("cart",JSON.stringify(newCart))
  }

  const removeItem = (index) => {
    const newCart = cart.filter((_,i)=>i!==index)
    setCart(newCart)
    localStorage.setItem("cart",JSON.stringify(newCart))
  }

  const totalPrice = cart.reduce((acc,item)=> acc + item.price*item.qty,0)

  const proceedToCheckout = () => {
    if(cart.length===0){
      toast.error("Cart is empty")
      return
    }
    router.push("/BuyNow")
  }

  if(cart.length===0) return <p className="text-center mt-10 text-xl p-10">Your cart is empty</p>

  return(
    <div className="p-8 bg-gray-50 min-h-screen">

      <h1 className="text-4xl font-bold mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 gap-6">

        {cart.map((item,index)=>(
          <div key={item._id} className="flex gap-6 border border-black rounded-xl p-4 bg-white">

            {/* Product Image */}
            <img src={item.images[0]} className="w-32 h-32 object-cover rounded" />

            {/* Product Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold">{item.title}</h2>
                <p className="text-gray-600">${item.price}</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-4">
                <button onClick={()=>updateCart(index,item.qty-1)} className="px-2 py-1 border border-black rounded hover:bg-black hover:text-white transition">
                  <Minus size={16}/>
                </button>

                <span>{item.qty}</span>

                <button onClick={()=>updateCart(index,item.qty+1)} className="px-2 py-1 border border-black rounded hover:bg-black hover:text-white transition">
                  <Plus size={16}/>
                </button>

                <button onClick={()=>removeItem(index)} className="ml-4 text-red-600 hover:text-red-800">
                  <X size={20}/>
                </button>
              </div>
            </div>

          </div>
        ))}

      </div>

      {/* Summary */}
      <div className="mt-8 border border-black rounded-xl p-6 bg-white max-w-md">

        <h2 className="text-2xl font-bold mb-4">Summary</h2>

        <div className="flex justify-between mb-2">
          <span>Subtotal:</span>
          <span>${totalPrice}</span>
        </div>

        <div className="flex justify-between mb-2">
          <span>Shipping:</span>
          <span>$0</span>
        </div>

        <div className="flex justify-between font-bold text-lg border-t border-black pt-2">
          <span>Total:</span>
          <span>${totalPrice}</span>
        </div>

        <button
          onClick={proceedToCheckout}
          className="mt-6 w-full bg-black text-white py-3 rounded hover:bg-gray-900 transition"
        >
          Proceed to Checkout
        </button>

      </div>

    </div>
  )
}