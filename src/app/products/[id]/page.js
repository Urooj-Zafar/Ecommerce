"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const router = useRouter();
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <p className="text-center mt-20">Loading product...</p>;
  if (!product) return <p className="text-center mt-20">Product not found</p>;

  const nextImage = () =>
    setCurrentImage((i) => (i + 1) % product.images.length);
  const prevImage = () =>
    setCurrentImage((i) => (i - 1 + product.images.length) % product.images.length);

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

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existIndex = cart.findIndex(
      (item) =>
        item._id === product._id &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );
    if (existIndex > -1) {
      if(cart[existIndex].qty + 1 > product.stock){
        toast.error("Cannot add more than stock");
        return;
      }
      cart[existIndex].qty += 1;
    } else {
      cart.push({ ...product, qty: 1, selectedSize, selectedColor });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Added to cart");
  };

  const buyNow = () => {
  if (product.sizes?.length && !selectedSize) {
    toast.error("Please select size");
    return;
  }

  if (product.colors?.length && !selectedColor) {
    toast.error("Please select color");
    return;
  }

  const buyProduct = {
    ...product,
    qty: 1,
    selectedSize,
    selectedColor
  };

  localStorage.setItem("buyNow", JSON.stringify(buyProduct));

  router.push("/BuyNow");
};

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start py-10 px-4">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-10 items-center justify-center">
        
        {/* Images */}
        <div className="flex flex-col items-center gap-4">
          <img
            src={product.images[currentImage]}
            alt={product.title}
            className="w-full max-w-md max-h-[600px] object-contain border border-black rounded-xl transition-transform hover:scale-105 cursor-pointer"
          />
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-2 flex-wrap justify-center">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`thumb-${idx}`}
                  className={`w-20 h-20 object-cover border rounded-lg cursor-pointer hover:scale-105 transition ${
                    idx === currentImage ? "border-black border-2" : "border-gray-300"
                  }`}
                  onClick={() => setCurrentImage(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 flex flex-col gap-4 max-w-md text-center lg:text-left">
          <h1 className="text-4xl font-bold">{product.title}</h1>
          <p className="text-gray-600">{product.desc}</p>
          <p className="text-2xl font-bold">Price: ${product.price}</p>
          <p className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
          </p>

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="flex flex-col gap-2 items-center lg:items-start">
              <p className="font-semibold">Select Size:</p>
              <div className="flex gap-2 flex-wrap justify-center">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`px-4 py-2 border rounded ${
                      selectedSize === size ? "border-black bg-black text-white" : "border-gray-300"
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="flex flex-col gap-2 items-center lg:items-start">
              <p className="font-semibold">Select Color:</p>
              <div className="flex gap-2 flex-wrap justify-center">
                {product.colors.map((color) => (
                  <div
                    key={color}
                    className={`w-8 h-8 rounded-full border cursor-pointer ${
                      selectedColor === color ? "ring-2 ring-black" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center lg:justify-start mt-4 flex-wrap">
            <button
              onClick={addToCart}
              disabled={product.stock < 1}
              className="px-6 py-3 bg-black text-white rounded hover:bg-gray-900 transition w-40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
            <button
              onClick={buyNow}
              disabled={product.stock < 1}
              className="px-6 py-3 bg-black text-white rounded hover:bg-gray-900 transition w-40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}