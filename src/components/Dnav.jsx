"use client"

import { useState } from "react"
import { Search, Bell, User, LogOut, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminTopNavbar() {
  const router = useRouter()
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  return (
    <header className="w-full h-16 border-b border-black bg-black flex items-center justify-between px-8 shadow-sm text-white">
      
      <div className="text-2xl font-bold">
        Admin Panel
      </div>

      <div className="flex items-center gap-6">

        <button className="relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-xs flex items-center justify-center rounded-full">
            3
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 border border-white px-3 py-1 rounded-md hover:bg-black hover:text-white transition"
          >
            <User size={16} />
            Admin
            <ChevronDown size={16} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-black border border-white rounded-md shadow-md z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-black hover:text-white transition flex gap-2 px-3 py-1"
              >
                Logout <LogOut size={16} />
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  )
}