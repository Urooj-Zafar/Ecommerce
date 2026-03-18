"use client"

import { useEffect,useState } from "react"
import axios from "axios"

export default function AdminDashboard(){

const [stats,setStats] = useState({
revenue:0,
orders:0,
products:0,
users:0
})

const [orders,setOrders] = useState([])
const [users,setUsers] = useState([])

const fetchData = async ()=>{

try{

const res = await axios.get("/api/admin/stats");

setStats(res.data?.stats || {})

setOrders(res.data?.recentOrders || [])

setUsers(res.data?.recentUsers || [])

}catch(err){

console.log(err)

}

}

useEffect(()=>{

fetchData()

},[])

return(

<div className="flex">

<div className="flex-1 p-10 bg-gray-50 min-h-screen">

<h1 className="text-4xl font-bold mb-10 text-center">
Dashboard
</h1>

{/* Stats */}

<div className="grid grid-cols-4 gap-6 mb-10">

<div className="border border-black p-6 bg-white rounded-xl">
<p className="text-sm text-gray-500">Total Revenue</p>
<h2 className="text-2xl font-bold">
${stats?.revenue || 0}
</h2>
</div>

<div className="border border-black p-6 bg-white rounded-xl">
<p className="text-sm text-gray-500">Orders</p>
<h2 className="text-2xl font-bold">
{stats?.orders || 0}
</h2>
</div>

<div className="border border-black p-6 bg-white rounded-xl">
<p className="text-sm text-gray-500">Products</p>
<h2 className="text-2xl font-bold">
{stats?.products || 0}
</h2>
</div>

<div className="border border-black p-6 bg-white rounded-xl">
<p className="text-sm text-gray-500">Users</p>
<h2 className="text-2xl font-bold">
{stats?.users || 0}
</h2>
</div>

</div>

{/* Recent Orders */}

<div className="mb-10">

<h2 className="text-2xl font-bold mb-4">
Recent Orders
</h2>

<div className="border border-black rounded-xl overflow-hidden bg-white">

<table className="w-full">

<thead className="bg-black text-white">

<tr className="text-left">
<th className="p-4">Order</th>
<th className="p-4">Customer</th>
<th className="p-4">Total</th>
<th className="p-4">Status</th>
</tr>

</thead>

<tbody>

{orders.length === 0 && (
<tr>
<td colSpan="4" className="p-4 text-center">
No Orders Yet
</td>
</tr>
)}

{orders.map(order => (

<tr key={order._id} className="border-b">

<td className="p-4">
#{order._id?.slice(-6)}
</td>

<td className="p-4">
{order.customer?.name || "N/A"}
</td>

<td className="p-4">
${order.total || 0}
</td>

<td className="p-4">

<span className="px-3 py-1 text-xs border border-black rounded-full">

{order.status || "pending"}

</span>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>


{/* Recent Users */}

<div>

<h2 className="text-2xl font-bold mb-4">
New Users
</h2>

<div className="border border-black rounded-xl overflow-hidden bg-white">

<table className="w-full">

<thead className="bg-black text-white">

<tr className="text-left">
<th className="p-4">Name</th>
<th className="p-4">Username</th>
<th className="p-4">Joined</th>
</tr>

</thead>

<tbody>

{users.length === 0 && (
<tr>
<td colSpan="3" className="p-4 text-center">
No Users Yet
</td>
</tr>
)}

{users.map(user => (

<tr key={user._id} className="border-b">

<td className="p-4">
{user.fullName}
</td>

<td className="p-4">
{user.userName}
</td>

<td className="p-4">
{new Date(user.createdAt).toLocaleDateString()}
</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

</div>

</div>

)
}