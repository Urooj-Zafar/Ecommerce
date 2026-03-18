"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10">
      
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-16 grid md:grid-cols-4 gap-12">
        
        <div>
          <h2 className="text-2xl font-bold tracking-wide mb-6">
            EliteShop
          </h2>
          <p className="text-white text-sm">
            Premium fashion & lifestyle products designed
            for modern individuals who value quality and style.
          </p>
        </div>

        <div>
          <h3 className="uppercase tracking-widest text-xl mb-6 text-white font-bold">
            Shop
          </h3>
          <ul className="space-y-3">
            <li>
              <Link href="/products" className="hover:text-gray-300 transition text-sm">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/new-arrivals" className="hover:text-gray-300 transition text-sm">
                New Arrivals
              </Link>
            </li>
            <li>
              <Link href="/best-sellers" className="hover:text-gray-300 transition text-sm">
                Best Sellers
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="uppercase tracking-widest text-xl mb-6 text-white font-bold">
            Company
          </h3>
          <ul className="space-y-3">
            <li>
              <Link href="/about" className="hover:text-gray-300 transition text-sm">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-gray-300 transition text-sm">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-gray-300 transition text-sm">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="uppercase tracking-widest text-xl mb-6 text-white font-bold">
            Follow Us
          </h3>

          <div className="flex gap-4">
            <Link href="#" className="p-2 border border-white/20 hover:bg-white hover:text-black transition">
              <Facebook size={18} />
            </Link>
            <Link href="#" className="p-2 border border-white/20 hover:bg-white hover:text-black transition">
              <Instagram size={18} />
            </Link>
            <Link href="#" className="p-2 border border-white/20 hover:bg-white hover:text-black transition">
              <Twitter size={18} />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} EliteShop. All rights reserved.</p>
          <p>Designed with precision & passion.</p>
        </div>
      </div>

    </footer>
  );
}