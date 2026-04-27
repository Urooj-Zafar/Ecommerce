import Link from "next/link";
export default function About() {
  return (
    <div className="bg-black text-white font-sans">

      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center bg-[url('/Mall.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/70"></div>
        <h1 className="relative text-5xl md:text-6xl font-bold tracking-wide text-center">
          About EliteShop
        </h1>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
        
        <div className="flex-1">
          <img
            src="/Group.jpg"
            alt="EliteShop Team"
            className="rounded-xl border-4 border-white shadow-lg hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Text */}
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl md:text-4xl font-semibold border-l-4 border-white pl-4">
            Who We Are
          </h2>
          <p className="text-gray-300 leading-relaxed text-lg">
            EliteShop is your premium online destination for curated products,
            blending quality, style, and convenience. We believe shopping should
            be effortless and enjoyable.
          </p>
          <p className="text-gray-300 leading-relaxed text-lg">
            Our team of experts carefully selects each item, ensuring you receive
            only the best. From the latest trends to timeless essentials, EliteShop
            brings you the products you love, with the service you deserve.
          </p>

          <Link href="/collections">
          <button className="mt-4 bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-gray-300 transition">
            Shop Now
          </button>
          </Link>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-white text-black py-20">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Quality First</h3>
            <p className="text-gray-700">Every product is vetted for excellence and durability.</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Customer Satisfaction</h3>
            <p className="text-gray-700">Our priority is making your shopping experience seamless.</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Fast & Secure</h3>
            <p className="text-gray-700">Quick deliveries and safe transactions are guaranteed.</p>
          </div>
        </div>
      </section>

<section className="relative h-96 flex flex-col items-center justify-center bg-[url('/wallpaper.jpg')] bg-cover bg-center">
  {/* Overlay */}
  <div className="absolute inset-0 bg-black/70"></div>

  {/* Content */}
  <div className="relative text-center max-w-2xl px-6 space-y-6">
    <h2 className="text-3xl md:text-4xl font-bold text-white">
      Our Mission
    </h2>
    <p className="text-gray-200 text-lg leading-relaxed">
      To provide a premium online shopping experience that combines quality,
      style, and exceptional service — all in a sleek, modern environment.
    </p>
    <Link href="/products">
    <button className="mt-4 bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-gray-300 transition">
      Explore Products
    </button>
    </Link>
  </div>
</section>

    </div>
  );
}