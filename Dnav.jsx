"use client"

import {Home } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Dnav() {
  const router = useRouter() 

  return (
    <header className="sticky top-0 z-30 h-16 bg-black text-white flex items-center justify-between px-4 md:px-6">

      <div className="flex items-center gap-3">
      <h1 className="font-bold ml-12">Admin</h1>
      </div>

   
      <div className="flex items-center gap-3">

        <button
          onClick={() => router.push("/")}
          className="p-2 hover:bg-white/10 rounded"
        >
          <Home size={20} className="text-white" />
        </button>

      </div>
    </header>
  )
}