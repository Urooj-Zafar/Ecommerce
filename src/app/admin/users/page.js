"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Trash2 } from "lucide-react"

export default function UsersPage(){

const [users,setUsers] = useState([])
const [loading,setLoading] = useState(true)

const fetchUsers = async ()=>{
    try{
        const res = await axios.get("/api/users")
        setUsers(res.data.users || [])
    }
    catch(err){
        console.log(err)
    }
    finally{
        setLoading(false)
    }
}

useEffect(()=>{
    fetchUsers()
},[])


const deleteUser = async(id)=>{
    try{

        if(!confirm("Delete this user?")) return

        await axios.delete(`/api/users/${id}`)

        setUsers(users.filter(u=>u._id !== id))

    }
    catch(err){
        console.log(err)
    }
}

if(loading) return <p className="p-10 text-center">Loading users...</p>

return(

<div className="p-2">

<h1 className="text-4xl font-bold mb-8 text-center">
Users
</h1>

<div className="border border-black rounded-xl overflow-hidden">

<table className="w-full">

<thead className="bg-black text-white">

<tr className="text-left">

<th className="p-4">Full Name</th>
<th className="p-4">User Name</th>
<th className="p-4">Role</th>
<th className="p-4">Joined</th>
<th className="p-4">Action</th>

</tr>

</thead>

<tbody>

{users.map((user)=> (

<tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">

<td className="p-4 font-medium text-black">
{user.fullName}
</td>

<td className="p-4">
{user.userName}
</td>

<td className="p-4">

{user.role === "admin"
?(
<span className="px-3 py-1 text-xs bg-black text-white rounded-full">
Admin
</span>
)
:(
<span className="px-3 py-1 text-xs border border-black rounded-full">
User
</span>
)}

</td>

<td className="p-4 text-sm text-gray-600">
{new Date(user.createdAt).toLocaleDateString()}
</td>

<td className="p-4">

<button
onClick={()=>deleteUser(user._id)}
className="border border-black p-2 rounded hover:bg-black hover:text-white transition"
>
<Trash2 size={16}/>
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