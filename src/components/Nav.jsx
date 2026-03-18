"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, LogOut } from "lucide-react";

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

      const totalQty = cart.reduce((acc,item)=> acc + item.qty,0);

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

<div className="sticky top-5 z-50 backdrop-blur-md bg-white text-black rounded-2xl px-5 shadow-xl">

<nav className="flex justify-between items-center p-4">

{/* Logo */}

<div
className="text-2xl font-bold cursor-pointer"
onClick={()=>router.push("/")}
>
EliteShop
</div>



{/* Desktop Links */}

<div className="hidden md:flex gap-6 font-semibold">

{links.map((link,i)=>{

const isActive =
pathname === link.path || pathname.startsWith(link.path + "/");

return(

<Link
key={i}
href={link.path}
className={`border-b-2 transition ${
isActive
? "border-black"
: "border-transparent hover:border-black"
}`}
>

{link.aName}

</Link>

);

})}

</div>



{/* Right Section */}

<div className="flex items-center gap-5">

{/* Cart */}

<Link href="/cart" className="relative">

<ShoppingCart size={22}/>

{cartCount > 0 && (

<span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-black text-white text-xs flex items-center justify-center rounded-full">

{cartCount}

</span>

)}

</Link>



{/* Logout */}

<button
onClick={handleLogout}
className="flex items-center gap-1"
>

Logout
<LogOut size={20}/>

</button>



{/* Mobile Toggle */}

<button
className="md:hidden text-2xl"
onClick={()=>setMenuOpen(!menuOpen)}
>

☰

</button>

</div>

</nav>



{/* Mobile Menu */}

{menuOpen && (

<div className="md:hidden bg-white border-t">

<div className="flex flex-col p-4 gap-3 font-semibold">

{links.map((link,i)=>(

<Link
key={i}
href={link.path}
onClick={()=>setMenuOpen(false)}
>

{link.aName}

</Link>

))}

</div>

</div>

)}

</div>

  );

}