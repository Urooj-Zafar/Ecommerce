"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [otherProducts, setOtherProducts] = useState([]);
  const [showOtherProducts, setShowOtherProducts] = useState(false);

  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  // For hover image
  const [hoveredIndex, setHoveredIndex] = useState({});


  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        const res = await axios.get(`/api/products/${id}`);

        setProduct(res.data);

        // Fetch all products for Other Products
        const allRes = await axios.get("/api/products");

        const products = allRes.data.products || [];

        // Remove current product
        const remainingProducts = products.filter(
          (p) => p._id !== id
        );

        setOtherProducts(remainingProducts);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);


  if (loading) {
    return (
      <p className="text-center mt-20 text-lg">
        Loading product...
      </p>
    );
  }

  if (!product) {
    return (
      <p className="text-center mt-20 text-lg">
        Product not found
      </p>
    );
  }

  const nextImage = () =>
    setCurrentImage(
      (i) => (i + 1) % product.images.length
    );

  const prevImage = () =>
    setCurrentImage(
      (i) =>
        (i - 1 + product.images.length) %
        product.images.length
    );


  const addToCart = () => {
    if (product.sizes?.length && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (product.colors?.length && !selectedColor) {
      toast.error("Please select a color");
      return;
    }

    if (product.stock < 1) {
      toast.error("Out of stock");
      return;
    }

    let cart =
      JSON.parse(localStorage.getItem("cart")) || [];

    const existIndex = cart.findIndex(
      (item) =>
        item._id === product._id &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );

    if (existIndex > -1) {
      if (
        cart[existIndex].qty + 1 >
        product.stock
      ) {
        toast.error("Cannot add more than stock");
        return;
      }

      cart[existIndex].qty += 1;
    } else {
      cart.push({
        ...product,
        qty: 1,
        selectedSize,
        selectedColor,
      });
    }

    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );

    toast.success("Added to cart");
  };




  const renderOtherProducts = () => {
    return otherProducts.map((item) => {
      const images = item.images || [];
      const index = hoveredIndex[item._id] || 0;

      return (
        <motion.div
          key={item._id}
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.4,
          }}
          className="relative border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl hover:scale-105 transition cursor-pointer"
        >
          {/* IMAGE */}
          <div
            className="relative w-full h-72"
            onMouseEnter={() => {
              if (images.length > 1) {
                setHoveredIndex({
                  ...hoveredIndex,
                  [item._id]: 1,
                });
              }
            }}
            onMouseLeave={() => {
              if (images.length > 1) {
                setHoveredIndex({
                  ...hoveredIndex,
                  [item._id]: 0,
                });
              }
            }}
          >
            {images.length > 0 && (
              <AnimatePresence initial={false}>
                <motion.img
                  key={index}
                  src={images[index]}
                  alt={item.title}
                  className="w-full h-72 object-cover absolute top-0 left-0"
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.4,
                  }}
                  onClick={() =>
                    router.push(
                      `/products/${item._id}`
                    )
                  }
                />
              </AnimatePresence>
            )}
          </div>

          {/* PRODUCT INFO */}
          <div className="p-4 flex flex-col gap-2">

            <h2 className="text-lg font-semibold text-gray-800 truncate">
              {item.title}
            </h2>

            <p className="text-red-600 font-medium">
              Price ${item.price}
            </p>

            <button
              onClick={() =>
                router.push(
                  `/products/${item._id}`
                )
              }
              className="mt-2 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition font-medium"
            >
              View Product
            </button>

          </div>
        </motion.div>
      );
    });
  };

  return (
    <div className="min-h-screen py-10 px-4">

      <div className="max-w-6xl mx-auto">

        <div className="bg-white rounded-2xl shadow-md p-6 md:p-10">

          <div className="flex flex-col lg:flex-row gap-10 items-center">

            {/* IMAGES */}

            <div className="flex flex-col items-center gap-4 w-full lg:w-1/2">

              <div className="relative">

                <img
                  src={product.images[currentImage]}
                  alt={product.title}
                  className="w-full max-w-md h-[400px] md:h-[500px] object-contain rounded-xl"
                />

                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white shadow rounded-full w-10 h-10"
                    >
                      ‹
                    </button>

                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow rounded-full w-10 h-10"
                    >
                      ›
                    </button>
                  </>
                )}

              </div>

              {/* THUMBNAILS */}

              {product.images.length > 1 && (
                <div className="flex gap-2 flex-wrap justify-center">

                  {product.images.map(
                    (img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`thumb-${idx}`}
                        className={`w-20 h-20 object-cover border rounded-lg cursor-pointer ${
                          idx === currentImage
                            ? "border-black border-2"
                            : "border-gray-300"
                        }`}
                        onClick={() =>
                          setCurrentImage(idx)
                        }
                      />
                    )
                  )}

                </div>
              )}

            </div>

            {/* DETAILS */}

            <div className="flex-1 flex flex-col gap-4 max-w-md text-center lg:text-left">

              <h1 className="text-4xl font-bold">
                {product.title}
              </h1>

              <p className="text-gray-600">
                {product.desc}
              </p>

              <p className="text-2xl font-bold">
                Price: ${product.price}
              </p>

              <p
                className={`font-semibold ${
                  product.stock > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {product.stock > 0
                  ? `In Stock: ${product.stock}`
                  : "Out of Stock"}
              </p>

              {/* SIZE */}

              {product.sizes?.length > 0 && (
                <div>
                  <p className="font-semibold mb-2">
                    Select Size:
                  </p>

                  <div className="flex gap-2 flex-wrap justify-center lg:justify-start">

                    {product.sizes.map(
                      (size) => (
                        <button
                          key={size}
                          className={`px-4 py-2 border rounded ${
                            selectedSize ===
                            size
                              ? "border-black bg-black text-white"
                              : "border-gray-300"
                          }`}
                          onClick={() =>
                            setSelectedSize(size)
                          }
                        >
                          {size}
                        </button>
                      )
                    )}

                  </div>
                </div>
              )}

              {/* COLORS */}

              {product.colors?.length > 0 && (
                <div>
                  <p className="font-semibold mb-2">
                    Select Color:
                  </p>

                  <div className="flex gap-2 justify-center lg:justify-start">

                    {product.colors.map(
                      (color) => (
                        <div
                          key={color}
                          className={`w-8 h-8 rounded-full border cursor-pointer ${
                            selectedColor ===
                            color
                              ? "ring-2 ring-black"
                              : "border-gray-300"
                          }`}
                          style={{
                            backgroundColor:
                              color,
                          }}
                          onClick={() =>
                            setSelectedColor(
                              color
                            )
                          }
                        />
                      )
                    )}

                  </div>
                </div>
              )}

              {/* BUTTONS */}

              <div className="flex gap-4 justify-center lg:justify-start mt-4 flex-wrap">

                <button
                  onClick={addToCart}
                  disabled={product.stock < 1}
                  className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition w-40 disabled:opacity-50"
                >
                  Add to Cart
                </button>

                

              </div>

            </div>

          </div>
        </div>

    
        {otherProducts.length > 0 && (
          <div className="flex justify-center mt-10">

            <button
              onClick={() =>
                setShowOtherProducts(
                  !showOtherProducts
                )
              }
              className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition font-semibold"
            >
              {showOtherProducts
                ? "Hide Other Products"
                : "Other Products"}
            </button>

          </div>
        )}

      
        {showOtherProducts &&
          otherProducts.length > 0 && (
            <section className="mt-10">

              <h2 className="text-3xl font-bold mb-8 text-center">
                Other Products
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
                {renderOtherProducts()}
              </div>

            </section>
          )}

      </div>
    </div>
  );
}