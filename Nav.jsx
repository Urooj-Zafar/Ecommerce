"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, LogOut, LayoutDashboard, Menu, X } from "lucide-react";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { path: "/", aName: "Home" },
    { path: "/collections", aName: "Collection" },
    { path: "/products", aName: "Products" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  useEffect(() => {
    const updateCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
      setCartCount(totalQty);
    };

    updateCount();

    window.addEventListener("cartUpdated", updateCount);
    window.addEventListener("storage", updateCount);

    return () => {
      window.removeEventListener("cartUpdated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  return (
    <div className="sticky top-4 z-50 px-4">
      <nav className="flex justify-between items-center px-6 py-4 bg-white/70 backdrop-blur-xl border border-black/10 rounded-2xl shadow-lg">
        {/* Logo */}
        <div
          className="text-2xl font-extrabold tracking-tight cursor-pointer"
          onClick={() => router.push("/")}
        >
          EliteShop
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 font-medium">
          {links.map((link, i) => {
            const isActive =
              pathname === link.path || pathname.startsWith(link.path + "/");

            return (
              <Link
                key={i}
                href={link.path}
                className={`relative group transition ${
                  isActive ? "text-black" : "text-black/60"
                }`}
              >
                {link.aName}
                <span
                  className={`absolute left-0 -bottom-1 h-[2px] bg-black transition-all duration-300 ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-5">
          {/* Admin Panel Icon */}
          <button
            onClick={() => router.push("/admin")}
            className="p-2 rounded-full hover:bg-black/10 transition"
          >
            <LayoutDashboard size={20} />
          </button>

          {/* Cart */}
          <Link href="/cart" className="relative p-2 rounded-full hover:bg-black/10 transition">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-black text-white text-xs flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-red-600 transition"
          >
            <LogOut size={18} /> Logout
          </button>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-black/10 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-2 bg-white border border-black/10 rounded-xl shadow-lg p-4 space-y-4">
          {links.map((link, i) => (
            <Link
              key={i}
              href={link.path}
              onClick={() => setMenuOpen(false)}
              className="block text-black/80 hover:text-black"
            >
              {link.aName}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-red-600"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}