"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [otherProducts, setOtherProducts] = useState([]);

  const [showOtherProducts, setShowOtherProducts] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [hoveredIndex, setHoveredIndex] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const res = await axios.get(
          `/api/products/${id}`
        );

        const fetchedProduct =
          res.data?.single || res.data?.product || res.data;

        setProduct(fetchedProduct);

        const allRes = await axios.get(
          "/api/products"
        );

        const products = Array.isArray(
          allRes.data?.products
        )
          ? allRes.data.products
          : [];

        setOtherProducts(
          products.filter(
            (p) => p?._id !== id
          )
        );
      } catch (error) {
        console.error(
          "FETCH PRODUCT ERROR:",
          error.response?.data || error
        );

        setProduct(null);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      setCurrentImage(0);
      setSelectedSize("");
      setSelectedColor("");
      setQuantity(1);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg">
          Loading product...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">
          Product not found
        </p>
      </div>
    );
  }

  const images = Array.isArray(product.images)
    ? product.images
    : [];

  const sizes = Array.isArray(product.sizes)
    ? product.sizes
    : [];

  const colors = Array.isArray(product.colors)
    ? product.colors
    : [];

  const stock = Number(product.stock || 0);

  const nextImage = () => {
    if (!images.length) return;

    setCurrentImage(
      (current) =>
        (current + 1) % images.length
    );
  };

  const prevImage = () => {
    if (!images.length) return;

    setCurrentImage(
      (current) =>
        (current - 1 + images.length) %
        images.length
    );
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  };

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(stock, current + 1)
    );
  };

  const validateProduct = () => {
    if (stock < 1) {
      toast.error("Out of stock");
      return false;
    }

    if (sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return false;
    }

    if (colors.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return false;
    }

    if (quantity > stock) {
      toast.error(
        "Quantity cannot be greater than stock"
      );
      return false;
    }

    return true;
  };

  const getCart = () => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      return Array.isArray(savedCart)
        ? savedCart
        : [];
    } catch {
      return [];
    }
  };

  const addToCart = () => {
    if (!validateProduct()) return;

    const cart = getCart();

    const existingIndex = cart.findIndex(
      (item) =>
        item?._id === product?._id &&
        item?.selectedSize === selectedSize &&
        item?.selectedColor === selectedColor
    );

    if (existingIndex !== -1) {
      const existingQty = Number(
        cart[existingIndex]?.qty || 0
      );

      if (
        existingQty + quantity >
        stock
      ) {
        toast.error(
          "Cannot add more than available stock"
        );
        return;
      }

      cart[existingIndex] = {
        ...cart[existingIndex],
        qty: existingQty + quantity,
      };
    } else {
      cart.push({
        ...product,
        qty: quantity,
        selectedSize: selectedSize || "",
        selectedColor: selectedColor || "",
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

  const handleBuyNow = () => {
    if (!validateProduct()) return;

    const buyNowProduct = {
      ...product,
      qty: quantity,
      selectedSize: selectedSize || "",
      selectedColor: selectedColor || "",
    };

    localStorage.setItem(
      "buyNow",
      JSON.stringify([buyNowProduct])
    );

    router.push("/buynow");
  };

  const renderOtherProducts = () => {
    return otherProducts.map((item) => {
      const itemImages = Array.isArray(
        item?.images
      )
        ? item.images
        : [];

      const index =
        hoveredIndex[item?._id] || 0;

      const image =
        itemImages[index] ||
        itemImages[0] ||
        "/user.jpeg";

      return (
        <motion.div
          key={item?._id}
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.3,
          }}
          className="relative border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-lg transition cursor-pointer"
          onClick={() =>
            router.push(
              `/products/${item?._id}`
            )
          }
        >

          <div
            className="relative w-full h-64 overflow-hidden bg-gray-50"
            onMouseEnter={() => {
              if (itemImages.length > 1) {
                setHoveredIndex((prev) => ({
                  ...prev,
                  [item?._id]: 1,
                }));
              }
            }}
            onMouseLeave={() => {
              setHoveredIndex((prev) => ({
                ...prev,
                [item?._id]: 0,
              }));
            }}
          >

            <AnimatePresence initial={false}>

              <motion.img
                key={image}
                src={image}
                alt={
                  item?.title || "Product"
                }
                className="w-full h-full object-cover absolute inset-0"
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
                  duration: 0.3,
                }}
              />

            </AnimatePresence>

          </div>

          <div className="p-4">

            <h2 className="text-base font-semibold truncate">
              {item?.title}
            </h2>

            <p className="mt-1 font-semibold">
              Rs.{" "}
              {Number(
                item?.price || 0
              ).toLocaleString()}
            </p>

            {item?.sizes?.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {item.sizes.join(", ")}
              </p>
            )}

            {item?.colors?.length > 0 && (
              <p className="text-xs text-gray-500 truncate">
                {item.colors.join(", ")}
              </p>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();

                router.push(
                  `/products/${item?._id}`
                );
              }}
              className="mt-3 w-full py-2 bg-black text-white text-sm hover:bg-gray-800"
            >
              View Product
            </button>

          </div>

        </motion.div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-14 px-3 sm:px-5">

      <div className="max-w-6xl mx-auto">

        <button
          type="button"
          onClick={() => router.back()}
          className="mb-5 text-sm text-gray-600 hover:text-black"
        >
          ← Back
        </button>

        <div className="bg-white p-5 md:p-10 shadow-sm">

          <div className="flex flex-col lg:flex-row gap-10">

            <div className="w-full lg:w-1/2">

              <div className="relative bg-gray-50">

                {images.length > 0 ? (

                  <img
                    src={images[currentImage]}
                    alt={product.title}
                    className="w-full h-[400px] md:h-[550px] object-contain"
                  />

                ) : (

                  <div className="h-[400px] md:h-[550px] flex items-center justify-center text-gray-400">
                    No Image
                  </div>

                )}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white shadow rounded-full w-10 h-10 flex items-center justify-center"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <button
                      type="button"
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white shadow rounded-full w-10 h-10 flex items-center justify-center"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

              </div>

              {images.length > 1 && (

                <div className="flex gap-2 mt-4 overflow-x-auto">

                  {images.map(
                    (image, index) => (

                      <button
                        key={index}
                        type="button"
                        onClick={() =>
                          setCurrentImage(index)
                        }
                        className={`shrink-0 border-2 ${
                          currentImage === index
                            ? "border-black"
                            : "border-gray-200"
                        }`}
                      >

                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-20 h-20 object-cover"
                        />

                      </button>

                    )
                  )}

                </div>

              )}

            </div>

            <div className="flex-1 flex flex-col gap-5">

              <h1 className="text-3xl md:text-4xl font-bold">
                {product.title}
              </h1>

              <p className="text-gray-600 leading-7">
                {product.desc}
              </p>

              <div className="text-3xl font-bold">
                Rs.{" "}
                {Number(
                  product.price || 0
                ).toLocaleString()}
              </div>

              <div
                className={`font-semibold ${
                  stock > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stock > 0
                  ? `${stock} items available`
                  : "Out of Stock"}
              </div>

              {sizes.length > 0 && (

                <div>

                  <p className="font-semibold mb-3">
                    Select Size
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {sizes.map((size) => (

                      <button
                        key={size}
                        type="button"
                        onClick={() =>
                          setSelectedSize(size)
                        }
                        className={`px-5 py-2 border rounded ${
                          selectedSize === size
                            ? "bg-black text-white border-black"
                            : "bg-white border-gray-300 hover:border-black"
                        }`}
                      >
                        {size}
                      </button>

                    ))}

                  </div>

                </div>

              )}

              {colors.length > 0 && (

                <div>

                  <p className="font-semibold mb-3">
                    Select Color
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {colors.map((color) => (

                      <button
                        key={color}
                        type="button"
                        onClick={() =>
                          setSelectedColor(color)
                        }
                        className={`px-4 py-2 border rounded ${
                          selectedColor === color
                            ? "bg-black text-white border-black"
                            : "bg-white border-gray-300 hover:border-black"
                        }`}
                      >
                        {color}
                      </button>

                    ))}

                  </div>

                </div>

              )}

              {stock > 0 && (

                <div>

                  <p className="font-semibold mb-2">
                    Quantity
                  </p>

                  <div className="flex items-center border border-black w-fit">

                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="w-10 h-10 disabled:opacity-40"
                    >
                      −
                    </button>

                    <span className="w-12 text-center">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={increaseQuantity}
                      disabled={
                        quantity >= stock
                      }
                      className="w-10 h-10 disabled:opacity-40"
                    >
                      +
                    </button>

                  </div>

                </div>

              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">

                <button
                  type="button"
                  onClick={addToCart}
                  disabled={stock < 1}
                  className="flex-1 py-3 bg-black text-white font-medium hover:bg-gray-800 disabled:opacity-40"
                >
                  Add to Cart
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={stock < 1}
                  className="flex-1 py-3 border border-black text-black font-medium hover:bg-black hover:text-white disabled:opacity-40"
                >
                  Buy Now
                </button>

              </div>

            </div>

          </div>

        </div>


        {
          otherProducts.length > 0 && (

            <section className="mt-10">

              <h2 className="text-3xl font-bold mb-8 text-center">
                Other Products
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                {renderOtherProducts()}
              </div>

            </section>

          )}

      </div>

    </div>
  );
}