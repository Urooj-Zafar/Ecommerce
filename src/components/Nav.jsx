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

  const handleLogin = () => {
    setMenuOpen(false);
    setLoginOpen(true);
  };

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

    window.dispatchEvent(
      new Event("userUpdated")
    );

    router.push("/");
  };

  useEffect(() => {
    const updateCount = () => {
      try {
        const cart =
          JSON.parse(
            localStorage.getItem("cart")
          ) || [];

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

  return (
    <>
      <div className="sticky top-4 z-50 px-4">
        <nav className="relative flex justify-between items-center px-6 py-4 bg-white/70 backdrop-blur-xl border border-black/10 rounded-2xl shadow-lg">

          <div
            className="text-2xl font-extrabold tracking-tight cursor-pointer"
            onClick={() => router.push("/")}
          >
            EliteShop
          </div>

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

          <div className="flex items-center gap-3">

            {isAdmin && (
              <button
                onClick={() =>
                  router.push("/admin")
                }
                className="p-2 rounded-full hover:bg-black/10 transition"
                title="Admin Dashboard"
              >
                <LayoutDashboard size={20} />
              </button>
            )}

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

            {isLoggedIn && (
              <button
                onClick={() =>
                  router.push("/profile")
                }
                className="p-2 rounded-full hover:bg-black/10 transition"
                title="Profile"
              >
                <User size={20} />
              </button>
            )}

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

            <button
              className="md:hidden p-2 rounded-full hover:bg-black/10 transition"
              onClick={() =>
                setMenuOpen(
                  (prev) => !prev
                )
              }
            >
              {menuOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>

          </div>

          {menuOpen && (
  <>
    <div
      className="fixed inset-0 z-40"
      onClick={() => setMenuOpen(false)}
    />

    <div
      ref={menuRef}
      className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-black/10 rounded-xl shadow-lg p-4 space-y-4"
    >
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

      {isLoggedIn ? (
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full text-red-600"
        >
          <LogOut size={18} />
          Logout
        </button>
      ) : (
        <button
          onClick={handleLogin}
          className="flex items-center gap-2 w-full text-black"
        >
          <LogIn size={18} />
          Login
        </button>
      )}
    </div>
  </>
)}

        </nav>
      </div>

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
