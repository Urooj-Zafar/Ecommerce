"use client"
import { AlignStartVertical, ChartBarStacked, ChevronLeft, ChevronRight, LayoutDashboard, ListOrdered, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'

export default function Sidebar () {
    const [open,setOpen] = useState(true)
    const pathname = usePathname()
    const toggle = ()=>{
        setOpen(!open)
    }
    const links = [
        {
            title:"Dashboard",
            route:"/admin",
            icon:<LayoutDashboard className='h-5 w-5' />
        },
        {
            title:"Products",
            route:"/admin/products",
            icon:<AlignStartVertical className='h-5 w-5' />
        },
        {
            title:"Category",
            route:"/admin/category",
            icon:<ChartBarStacked className='h-5 w-5' />
        },
        {
            title:"users",
            route:"/admin/users",
            icon:<  Users className='h-5 w-5' />
        },
        {
            title:"Orders",
            route:"/admin/orders",
            icon:<ListOrdered className='h-5 w-5' />
        },

    ]
  return (
    <div className={` bg-black rounded-xl m-2 ${open ?"w-56":"w-20"} relative duration-700 transition-all overflow-hidden`}>
      <h1 className='flex items-center justify-center p-2 text-white'>Admin</h1>
      <div className=' p-3 flex flex-col gap-3 overflow-hidden'>
      {links.map((v,i)=>(
        <Link href={v.route} key={i} className={` flex items-center overflow-hidden gap-2 p-2 rounded-lg  border ${open?" ":"justify-center"}  ${pathname === v.route ?"bg-white text-theme underline ":"bg-white text-black "} `}>
            {v.icon}
            <p className={`${open ?"block ":"hidden"}`}>{v.title}</p>
        </Link>
      ))}
      </div>
      <button onClick={toggle} className=' absolute bottom-2 right-0 bg-black text-white p-2'> {open ?<ChevronLeft className='h-6 w-6'/>:<ChevronRight className='h-6 w-6'/>}</button>
    </div>
  )
}

