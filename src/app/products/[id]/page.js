"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [product, setProduct] = useState(null);
  const [otherProducts, setOtherProducts] = useState([]);


const [reviews, setReviews] = useState([]);
const [productRating, setProductRating] = useState(0);
const [reviewsCount, setReviewsCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [hoveredIndex, setHoveredIndex] = useState({});
  useEffect(() => {
  if (!id) return;

  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `/api/products/${id}/reviews`
      );

      if (res.data.success) {
        setReviews(res.data.reviews || []);
        setProductRating(res.data.rating || 0);
        setReviewsCount(res.data.reviewsCount || 0);
      }
    } catch (error) {
      console.error(
        "FETCH REVIEWS ERROR:",
        error.response?.data || error
      );
    }
  };

  fetchReviews();
}, [id]);
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
const submitReview = async () => {
  if (!selectedRating) {
    toast.error("Please select a rating");
    return;
  }

  setSubmittingReview(true);

  try {
    const res = await axios.post(
      `/api/products/${id}/reviews`,
      {
        rating: selectedRating,
        comment: reviewComment,
      },
      {
        withCredentials: true,
      }
    );

    if (res.data.success) {
      const updatedProduct = res.data.product;

      setReviews(updatedProduct.reviews || []);
      setProductRating(updatedProduct.rating || 0);
      setReviewsCount(
        updatedProduct.reviewsCount || 0
      );

      setSelectedRating(0);
      setHoverRating(0);
      setReviewComment("");

      toast.success(res.data.message);
    }
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Failed to submit review"
    );
  } finally {
    setSubmittingReview(false);
  }
};
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
  const getColorValue = (color) => {
  const colorMap = {
    black: "#000000",
    white: "#ffffff",
    red: "#ef4444",
    blue: "#3b82f6",
    navy: "#1e3a8a",
    "navy blue": "#1e3a8a",
    green: "#22c55e",
    pink: "#ec4899",
    purple: "#a855f7",
    yellow: "#eab308",
    orange: "#f97316",
    brown: "#92400e",
    beige: "#f5f5dc",
    gray: "#808080",
    grey: "#808080",
    silver: "#c0c0c0",
    gold: "#d4af37",
  };

  return colorMap[color.toLowerCase().trim()] || color;
};
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

    router.push("/buy");
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

             <div>
  <p
    className={`text-gray-600 leading-7 ${
      !showFullDescription ? "line-clamp-1" : ""
    }`}
  >
    {product.desc}
  </p>

  {product.desc?.length > 150 && (
    <button
      type="button"
      onClick={() =>
        setShowFullDescription((prev) => !prev)
      }
      className="mt-2 text-sm font-semibold text-black hover:underline"
    >
      {showFullDescription ? "View less" : "View more"}
    </button>
  )}
</div>

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

                  <div className="flex flex-wrap gap-3">
  {colors.map((color) => {
    const colorValue = getColorValue(color);
    const isSelected = selectedColor === color;

    return (
      <button
        key={color}
        type="button"
        title={color}
        aria-label={`Select ${color}`}
        onClick={() => setSelectedColor(color)}
        className={`
          w-8 h-8
          rounded-full
          flex items-center justify-center
          border-2
          transition-all
          duration-200
          ${
            isSelected
              ? "border-black ring-2 ring-gray-300 scale-110"
              : "border-gray-300 hover:border-black"
          }
        `}
      >
        <span
          className="w-7 h-7 rounded-full"
          style={{
            backgroundColor: colorValue,
          }}
        />
      </button>
    );
  })}
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

<div className="mt-1 bg-white p-3">

  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

    <div>
      <h2 className="text-xl font-semibold">
        Customer Reviews
      </h2>

      <p className="text-sm text-gray-500 mt-1">
        {reviewsCount} reviews
      </p>
    </div>

    <div className="flex items-center gap-3">

      <div className="text-3xl font-bold">
        {Number(productRating || 0).toFixed(1)}
      </div>

      <div>
        <div className="flex text-yellow-400">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={18}
              fill={
                index < Math.round(productRating || 0)
                  ? "currentColor"
                  : "none"
              }
            />
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-1">
          Based on {reviewsCount} reviews
        </p>
      </div>

    </div>

  </div>

  <div className="border-t pt-5">

    {reviews.length === 0 ? (

      <div className="py-10 text-center">
        <p className="text-gray-500 text-sm">
          No reviews yet.
        </p>
      </div>

    ) : (

      <div className="space-y-5">

        {reviews.map((review, index) => (

          <div
            key={review._id || index}
            className="border-b pb-5 last:border-b-0 last:pb-0"
          >

            <div className="flex items-start justify-between gap-3">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="font-semibold text-sm text-gray-600">
                    {(
                      review.user?.fullName ||
                      review.user?.userName ||
                      "C"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>

                <div>

                  <p className="font-semibold text-sm">
                    {review.user?.fullName ||
                      review.user?.userName ||
                      "Customer"}
                  </p>

                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map(
                      (_, starIndex) => (
                        <Star
                          key={starIndex}
                          size={14}
                          className="text-yellow-400"
                          fill={
                            starIndex <
                            Number(review.rating || 0)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      )
                    )}
                  </div>

                </div>

              </div>

              <span className="text-xs text-gray-400 whitespace-nowrap">
                {review.createdAt
                  ? new Date(
                      review.createdAt
                    ).toLocaleDateString()
                  : ""}
              </span>

            </div>

            {review.comment && (
              <p className="text-sm text-gray-600 leading-6 mt-3 ml-[52px]">
                {review.comment}
              </p>
            )}

          </div>

        ))}

      </div>

    )}

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