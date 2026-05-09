"use client";

import {
  LayoutDashboard,
  AlignStartVertical,
  ChartBarStacked,
  Users,
  ListOrdered,
  ChevronLeft,
  ChevronRight,
  X,
  Menu
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false); // mobile menu
  const [collapsed, setCollapsed] = useState(false); // desktop collapse

  const links = [
    { title: "Dashboard", route: "/admin", icon: <LayoutDashboard size={18} /> },
    { title: "Products", route: "/admin/products", icon: <AlignStartVertical size={18} /> },
    { title: "Category", route: "/admin/category", icon: <ChartBarStacked size={18} /> },
    { title: "Users", route: "/admin/users", icon: <Users size={18} /> },
    { title: "Orders", route: "/admin/orders", icon: <ListOrdered size={18} /> },
  ];

  return (
    <>
      {/* MOBILE overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed md:static top-0 left-0 z-50 h-full bg-black text-white transition-all duration-300
          w-56 md:${collapsed ? "w-20" : "w-56"}
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <span className={`${collapsed ? "hidden md:block text-center w-full" : "font-bold"}`}>
            Admin
          </span>

          {/* Mobile close button */}
          <button onClick={() => setOpen(false)} className="md:hidden">
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* LINKS */}
        <div className="p-3 flex flex-col gap-2">
          {links.map((link, i) => {
            const active = pathname === link.route;
            return (
              <Link
                key={i}
                href={link.route}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3 p-2 rounded-lg transition
                  ${active ? "bg-white text-black" : "hover:bg-white/10"}
                  ${collapsed ? "md:justify-center" : ""}
                `}
              >
                {link.icon}
                <span className={`${collapsed ? "md:hidden" : ""}`}>{link.title}</span>
              </Link>
            );
          })}
        </div>

        {/* COLLAPSE DESKTOP BUTTON */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:block absolute bottom-4 right-2 p-1 rounded hover:bg-white/10 transition"
        >
          {collapsed ? <ChevronRight className="text-white" /> : <ChevronLeft className="text-white" />}
        </button>
      </div>

      {/* MOBILE: hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="p-5 z-40 fixed bg-black text-white rounded-md"
      >
        <Menu size={20} />
      </button>
    </>
  );
}