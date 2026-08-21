"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  ShoppingCart,
  LogOut,
  LogIn,
  LayoutDashboard,
  User,
  Menu,
  X,
} from "lucide-react";

import Login from "./Login";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);

  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef(null);

  const links = [
    { path: "/", aName: "Home" },
    { path: "/collections", aName: "Collection" },
    { path: "/products", aName: "Products" },
  ];

  // =========================
  // LOAD USER
  // =========================
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to read user:", error);
        setUser(null);
      }
    };

    loadUser();

    window.addEventListener("userUpdated", loadUser);
    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("userUpdated", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const isLoggedIn = !!user;

  const isAdmin =
    user?.role?.toLowerCase() === "admin";

  // =========================
  // LOGIN
  // =========================
  const handleLogin = () => {
    setMenuOpen(false);
    setLoginOpen(true);
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("user");

    setUser(null);
    setMenuOpen(false);

    window.dispatchEvent(new Event("userUpdated"));

    router.push("/");
  };

  // =========================
  // CART COUNT
  // =========================
  useEffect(() => {
    const updateCount = () => {
      try {
        const cart =
          JSON.parse(localStorage.getItem("cart")) || [];

        const totalQty = cart.reduce(
          (acc, item) =>
            acc + Number(item.qty || 0),
          0
        );

        setCartCount(totalQty);
      } catch {
        setCartCount(0);
      }
    };

    updateCount();

    window.addEventListener(
      "cartUpdated",
      updateCount
    );

    window.addEventListener(
      "storage",
      updateCount
    );

    return () => {
      window.removeEventListener(
        "cartUpdated",
        updateCount
      );

      window.removeEventListener(
        "storage",
        updateCount
      );
    };
  }, []);

  // =========================
  // CLOSE SIDEBAR OUTSIDE
  // =========================
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "touchstart",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "touchstart",
        handleOutsideClick
      );
    };
  }, [menuOpen]);

  const goTo = (path) => {
    setMenuOpen(false);
    router.push(path);
  };

  return (
    <>
      <div className="fixed top-2 z-50 p-2 w-full">
        <nav className="relative flex justify-between items-center px-6 py-4 bg-white/10 backdrop-blur-xl border border-black/10 rounded-2xl shadow-lg">

          {/* LOGO */}
          <div
            className="text-2xl font-extrabold tracking-tight cursor-pointer"
            onClick={() => router.push("/")}
          >
            EliteShop
          </div>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden md:flex gap-8 font-medium">
            {links.map((link, i) => {
              const isActive =
                pathname === link.path ||
                pathname.startsWith(
                  link.path + "/"
                );

              return (
                <Link
                  key={i}
                  href={link.path}
                  className={`relative group transition ${
                    isActive
                      ? "text-black"
                      : "text-black/60"
                  }`}
                >
                  {link.aName}

                  <span
                    className={`absolute left-0 -bottom-1 h-[2px] bg-black transition-all duration-300 ${
                      isActive
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">

            {/* ADMIN - DESKTOP ONLY */}
            {isAdmin && (
              <button
                onClick={() =>
                  router.push("/admin")
                }
                className="hidden md:block p-2 rounded-full hover:bg-black/10 transition"
                title="Admin Dashboard"
              >
                <LayoutDashboard size={20} />
              </button>
            )}

            {/* CART - ALWAYS VISIBLE */}
            <Link
              href="/cart"
              className="relative p-2 rounded-full hover:bg-black/10 transition"
              title="Cart"
            >
              <ShoppingCart size={20} />

              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-black text-white text-xs flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* PROFILE - DESKTOP ONLY */}
            {isLoggedIn && (
              <button
                onClick={() =>
                  router.push("/profile")
                }
                className="hidden md:block p-2 rounded-full hover:bg-black/10 transition"
                title="Profile"
              >
                <User size={20} />
              </button>
            )}

            {/* LOGIN / LOGOUT - DESKTOP ONLY */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-red-600 transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition"
              >
                <LogIn size={18} />
                Login
              </button>
            )}

            {/* MOBILE MENU BUTTON */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-black/10 transition"
              onClick={() =>
                setMenuOpen((prev) => !prev)
              }
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>
          </div>
        </nav>
      </div>

   
      {/* MOBILE SIDEBAR */}

{/* OVERLAY */}
<div
  className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${
    menuOpen
      ? "opacity-100 visible"
      : "opacity-0 invisible pointer-events-none"
  }`}
  onClick={() => setMenuOpen(false)}
/>

{/* SIDEBAR */}
<aside
  ref={menuRef}
  className={`fixed top-0 left-0 h-full w-[280px] max-w-[85%] bg-black text-white z-[70] shadow-2xl transition-transform duration-500 ease-in-out md:hidden ${
    menuOpen
      ? "translate-x-0"
      : "-translate-x-full"
  }`}
>
  {/* SIDEBAR HEADER */}
  <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
    <span className="text-xl font-bold text-white">
      EliteShop
    </span>

    <button
      onClick={() => setMenuOpen(false)}
      className="p-2 rounded-full hover:bg-white/10 transition"
    >
      <X size={22} className="text-white" />
    </button>
  </div>

  {/* SIDEBAR CONTENT */}
  <div className="px-5">
    <div className="flex flex-col">

      {/* NAV LINKS */}
      {links.map((link, i) => {
        const isActive =
          pathname === link.path ||
          pathname.startsWith(link.path + "/");

        return (
          <Link
            key={i}
            href={link.path}
            onClick={() => setMenuOpen(false)}
            className={`py-2 text-base transition ${
              isActive
                ? "font-semibold text-white"
                : "text-white/70 hover:text-white"
            }`}
          >
            {link.aName}
          </Link>
        );
      })}

      {/* PROFILE */}
      {isLoggedIn && (
        <button
          onClick={() => goTo("/profile")}
          className="w-full text-left py-2 text-white/70 hover:text-white transition"
        >
          Profile
        </button>
      )}

      {/* ADMIN */}
      {isAdmin && (
        <button
          onClick={() => goTo("/admin")}
          className="w-full text-left py-2 text-white/70 hover:text-white transition"
        >
          Dashboard
        </button>
      )}

      {/* LOGIN / LOGOUT */}
      {isLoggedIn ? (
        <button
          onClick={handleLogout}
          className="w-full text-left py-2 text-red-400 hover:text-red-300 transition"
        >
          Logout
        </button>
      ) : (
        <button
          onClick={handleLogin}
          className="w-full text-left py-2 text-white/70 hover:text-white transition"
        >
          Login
        </button>
      )}
    </div>
  </div>
</aside>

      {/* LOGIN MODAL */}
      {loginOpen && (
        <Login
          onClose={() =>
            setLoginOpen(false)
          }
        />
      )}
    </>
  );
}