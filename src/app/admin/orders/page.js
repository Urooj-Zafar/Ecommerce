"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Eye } from "lucide-react"

export default function OrdersPage() {

  const [orders,setOrders] = useState([])
  const [loading,setLoading] = useState(true)

  const fetchOrders = async () => {
    try{
      const res = await axios.get("/api/orders")
      setOrders(res.data.orders || [])
    }
    catch(err){
      console.log(err)
    }
    finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchOrders()
  },[])

  const statusStyle = (status)=>{
    switch(status){
      case "pending":
        return "border-black text-black"
      case "shipped":
        return "bg-black text-white"
      case "delivered":
        return "bg-gray-800 text-white"
      case "cancelled":
        return "border border-gray-400 text-gray-500"
      default:
        return "border-black"
    }
  }

  if(loading) return <p className="p-10 text-center">Loading orders...</p>

  return (

    <div className="p-2">

      <h1 className="text-4xl font-bold mb-8 text-center">
        Orders
      </h1>

      <div className="border border-black rounded-xl overflow-hidden">

        <table className="w-full">

          <thead className="border-b border-black bg-black text-white">

            <tr className="text-left">

              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Items</th>
              <th className="p-4">Total</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4">Action</th>

            </tr>

          </thead>

          <tbody>

            {orders.map((order)=> (

              <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50">

                <td className="p-4 font-medium">
                  #{order._id.slice(-6)}
                </td>

                <td className="p-4">
                  <div>
                    <p className="font-medium">{order.customer?.name}</p>
                    <p className="text-sm text-gray-500">{order.customer?.email}</p>
                  </div>
                </td>

                <td className="p-4">
                  {order.items?.length} items
                </td>

                <td className="p-4 font-semibold">
                  ${order.total}
                </td>

                <td className="p-4">

                  {order.paymentStatus === "paid"
                  ? (
                    <span className="px-3 py-1 text-xs bg-black text-white rounded-full">
                      Paid
                    </span>
                  )
                  : (
                    <span className="px-3 py-1 text-xs border border-black rounded-full">
                      Unpaid
                    </span>
                  )}

                </td>

                <td className="p-4">

                  <span
                    className={`px-3 py-1 text-xs rounded-full border ${statusStyle(order.status)}`}
                  >
                    {order.status}
                  </span>

                </td>

                <td className="p-4 text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>

                <td className="p-4">

                  <button
                    className="flex items-center gap-2 border border-black px-3 py-1 rounded-md hover:bg-black hover:text-white transition"
                  >
                    <Eye size={16}/>
                    View
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )
}