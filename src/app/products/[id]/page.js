"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
} from "lucide-react";

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id;

  const [product, setProduct] = useState(null);
  const [otherProducts, setOtherProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const [quantity, setQuantity] = useState(1);

  const [hoveredIndex, setHoveredIndex] = useState({});

  // ==========================================
  // FETCH PRODUCT
  // ==========================================

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `/api/products/${id}`
        );

        const fetchedProduct =
          res.data?.product ||
          res.data?.data ||
          res.data;

        if (!fetchedProduct?._id) {
          setProduct(null);
          return;
        }

        setProduct(fetchedProduct);

        // Fetch other products
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
            (item) =>
              item?._id !== fetchedProduct?._id
          )
        );
      } catch (error) {
        console.error(
          "FETCH PRODUCT ERROR:",
          error.response?.data || error
        );

        setProduct(null);

        toast.error(
          "Failed to load product"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 pt-28 pb-12">
        <div className="max-w-[1400px] mx-auto px-4">

          <div className="h-5 w-40 bg-gray-200 animate-pulse mb-5" />

          <div className="bg-white p-5 md:p-8">
            <div className="grid lg:grid-cols-2 gap-10">

              <div className="flex gap-4">
                <div className="w-20 space-y-3">
                  {Array.from({
                    length: 4,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gray-200 animate-pulse"
                    />
                  ))}
                </div>

                <div className="flex-1 aspect-square bg-gray-200 animate-pulse" />
              </div>

              <div className="space-y-5">
                <div className="h-8 bg-gray-200 animate-pulse w-3/4" />
                <div className="h-5 bg-gray-200 animate-pulse w-full" />
                <div className="h-10 bg-gray-200 animate-pulse w-1/3" />
                <div className="h-12 bg-gray-200 animate-pulse w-full" />
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PRODUCT NOT FOUND
  // ==========================================

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100 pt-32 px-4">
        <div className="max-w-xl mx-auto bg-white p-10 text-center">
          <h2 className="text-xl font-semibold">
            Product not found
          </h2>

          <button
            type="button"
            onClick={() => router.push("/products")}
            className="
              mt-5
              bg-black
              text-white
              px-6
              py-3
              hover:bg-gray-800
              transition
            "
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // IMAGES
  // ==========================================

  const images = Array.isArray(product?.images)
    ? product.images
    : [];

  const currentImageSrc =
    images[currentImage] ||
    images[0] ||
    "https://github.com/scriptwithahmad/u-shop-2.0/blob/main/public/user.jpeg?raw=true";

  // ==========================================
  // IMAGE NAVIGATION
  // ==========================================

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImage(
        (index) =>
          (index + 1) % images.length
      );
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImage(
        (index) =>
          (index - 1 + images.length) %
          images.length
      );
    }
  };

  // ==========================================
  // DISCOUNT
  // ==========================================

  const getDiscount = () => {
    if (product?.discount) {
      return Number(product.discount);
    }

    if (
      product?.originalPrice &&
      product?.price &&
      Number(product.originalPrice) >
        Number(product.price)
    ) {
      return Math.round(
        ((Number(product.originalPrice) -
          Number(product.price)) /
          Number(product.originalPrice)) *
          100
      );
    }

    return 0;
  };

  const discount = getDiscount();

  // ==========================================
  // QUANTITY
  // ==========================================

  const increaseQuantity = () => {
    const stock = Number(product?.stock || 0);

    if (quantity < stock) {
      setQuantity((qty) => qty + 1);
    }
  };

  const decreaseQuantity = () => {
    setQuantity((qty) =>
      Math.max(1, qty - 1)
    );
  };

  // ==========================================
  // ADD TO CART
  // ==========================================

  const addToCart = () => {
    if (
      product?.sizes?.length &&
      !selectedSize
    ) {
      toast.error(
        "Please select a size"
      );
      return;
    }

    if (
      product?.colors?.length &&
      !selectedColor
    ) {
      toast.error(
        "Please select a color"
      );
      return;
    }

    if (Number(product?.stock || 0) < 1) {
      toast.error("Out of stock");
      return;
    }

    let cart = [];

    try {
      cart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      if (!Array.isArray(cart)) {
        cart = [];
      }
    } catch {
      cart = [];
    }

    const existingIndex = cart.findIndex(
      (item) =>
        item?._id === product?._id &&
        item?.selectedSize === selectedSize &&
        item?.selectedColor === selectedColor
    );

    if (existingIndex > -1) {
      const existingQty =
        cart[existingIndex]?.qty || 0;

      if (
        existingQty + quantity >
        Number(product.stock)
      ) {
        toast.error(
          "Cannot add more than available stock"
        );
        return;
      }

      cart[existingIndex].qty =
        existingQty + quantity;
    } else {
      cart.push({
        ...product,
        qty: quantity,
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

  // ==========================================
  // BUY NOW
  // ==========================================

  const buyNow = () => {
    if (
      product?.sizes?.length &&
      !selectedSize
    ) {
      toast.error(
        "Please select a size"
      );
      return;
    }

    if (
      product?.colors?.length &&
      !selectedColor
    ) {
      toast.error(
        "Please select a color"
      );
      return;
    }

    if (Number(product?.stock || 0) < 1) {
      toast.error("Out of stock");
      return;
    }

    let cart = [];

    try {
      cart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      if (!Array.isArray(cart)) {
        cart = [];
      }
    } catch {
      cart = [];
    }

    const existingIndex = cart.findIndex(
      (item) =>
        item?._id === product?._id &&
        item?.selectedSize === selectedSize &&
        item?.selectedColor === selectedColor
    );

    if (existingIndex > -1) {
      cart[existingIndex].qty =
        (cart[existingIndex].qty || 0) +
        quantity;
    } else {
      cart.push({
        ...product,
        qty: quantity,
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

    router.push("/cart");
  };

  // ==========================================
  // RELATED PRODUCT DISCOUNT
  // ==========================================

  const getItemDiscount = (item) => {
    if (item?.discount) {
      return Number(item.discount);
    }

    if (
      item?.originalPrice &&
      item?.price &&
      Number(item.originalPrice) >
        Number(item.price)
    ) {
      return Math.round(
        ((Number(item.originalPrice) -
          Number(item.price)) /
          Number(item.originalPrice)) *
          100
      );
    }

    return 0;
  };

  // ==========================================
  // RETURN
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-100 pt-28 pb-14">

      <div className="max-w-[1400px] mx-auto px-3 sm:px-5">

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <button
            type="button"
            onClick={() =>
              router.push("/products")
            }
            className="hover:text-black"
          >
            Products
          </button>

          <span>/</span>

          <span className="text-gray-800 truncate">
            {product.title}
          </span>
        </div>

      
        <div className="bg-white">

          <div className="grid lg:grid-cols-[55%_45%]">

         
            <div className="
              p-4
              md:p-7
              lg:p-10
              border-b
              lg:border-b-0
              lg:border-r
              border-gray-200
            ">

              <div className="flex gap-4">

                {/* THUMBNAILS */}

                {images.length > 1 && (
                  <div className="
                    hidden
                    sm:flex
                    flex-col
                    gap-3
                    w-[72px]
                    shrink-0
                  ">

                    {images.map(
                      (image, index) => (
                        <button
                          key={`${image}-${index}`}
                          type="button"
                          onClick={() =>
                            setCurrentImage(index)
                          }
                          className={`
                            w-[68px]
                            h-[68px]
                            border
                            bg-white
                            overflow-hidden
                            ${
                              currentImage ===
                              index
                                ? "border-black border-2"
                                : "border-gray-200"
                            }
                          `}
                        >
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="
                              w-full
                              h-full
                              object-cover
                            "
                          />
                        </button>
                      )
                    )}

                  </div>
                )}

                {/* MAIN IMAGE */}

                <div className="
                  relative
                  flex-1
                  min-w-0
                  aspect-square
                  bg-white
                  overflow-hidden
                ">

                  <img
                    src={currentImageSrc}
                    alt={
                      product?.title ||
                      "Product"
                    }
                    className="
                      w-full
                      h-full
                      object-contain
                    "
                  />

                  {/* DISCOUNT */}

                  {discount > 0 && (
                    <div className="
                      absolute
                      top-3
                      left-3
                      bg-black
                      text-white
                      text-xs
                      px-3
                      py-1.5
                      font-medium
                    ">
                      -{discount}%
                    </div>
                  )}

                  {/* PREVIOUS */}

                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={prevImage}
                      className="
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        w-9
                        h-9
                        bg-white
                        border
                        border-gray-200
                        shadow-sm
                        flex
                        items-center
                        justify-center
                        hover:bg-black
                        hover:text-white
                        transition
                      "
                    >
                      <ChevronLeft size={20} />
                    </button>
                  )}

                  {/* NEXT */}

                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={nextImage}
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        w-9
                        h-9
                        bg-white
                        border
                        border-gray-200
                        shadow-sm
                        flex
                        items-center
                        justify-center
                        hover:bg-black
                        hover:text-white
                        transition
                      "
                    >
                      <ChevronRight size={20} />
                    </button>
                  )}

                </div>
              </div>

              {/* MOBILE THUMBNAILS */}

              {images.length > 1 && (
                <div className="
                  flex
                  sm:hidden
                  gap-2
                  mt-4
                  overflow-x-auto
                  pb-1
                ">
                  {images.map(
                    (image, index) => (
                      <button
                        key={`${image}-mobile-${index}`}
                        type="button"
                        onClick={() =>
                          setCurrentImage(index)
                        }
                        className={`
                          w-16
                          h-16
                          shrink-0
                          border
                          overflow-hidden
                          ${
                            currentImage ===
                            index
                              ? "border-black border-2"
                              : "border-gray-200"
                          }
                        `}
                      >
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="
                            w-full
                            h-full
                            object-cover
                          "
                        />
                      </button>
                    )
                  )}
                </div>
              )}

            </div>

            <div className="
              p-5
              md:p-8
              lg:p-10
            ">

              {/* TITLE */}

              <h1 className="
                text-xl
                md:text-2xl
                lg:text-3xl
                font-medium
                text-gray-900
                leading-snug
              ">
                {product.title}
              </h1>

              {/* DESCRIPTION */}

              {product?.desc && (
                <p className="
                  mt-4
                  text-sm
                  leading-6
                  text-gray-500
                ">
                  {product.desc}
                </p>
              )}

              {/* PRICE BOX */}

              <div className="
                bg-gray-50
                mt-5
                p-4
                border-y
                border-gray-200
              ">

                <div className="
                  flex
                  items-center
                  gap-3
                  flex-wrap
                ">

                  <span className="
                    text-3xl
                    font-semibold
                    text-black
                  ">
                    Rs.{" "}
                    {Number(
                      product?.price || 0
                    ).toLocaleString()}
                  </span>

                  {product?.originalPrice &&
                    Number(
                      product.originalPrice
                    ) >
                      Number(product.price) && (
                      <span className="
                        text-sm
                        text-gray-400
                        line-through
                      ">
                        Rs.{" "}
                        {Number(
                          product.originalPrice
                        ).toLocaleString()}
                      </span>
                    )}

                  {discount > 0 && (
                    <span className="
                      text-xs
                      bg-black
                      text-white
                      px-2
                      py-1
                    ">
                      -{discount}%
                    </span>
                  )}

                </div>

              </div>

              {/* DELIVERY */}

              <div className="
                border-b
                border-gray-200
                py-5
                space-y-4
              ">

                <div className="
                  flex
                  gap-3
                  items-start
                ">
                  <Truck
                    size={20}
                    className="shrink-0"
                  />

                  <div>
                    <p className="
                      text-sm
                      font-medium
                    ">
                      Delivery
                    </p>

                    <p className="
                      text-xs
                      text-gray-500
                      mt-1
                    ">
                      Free Delivery available
                    </p>
                  </div>
                </div>

                <div className="
                  flex
                  gap-3
                  items-start
                ">
                  <ShieldCheck
                    size={20}
                    className="shrink-0"
                  />

                  <div>
                    <p className="
                      text-sm
                      font-medium
                    ">
                      Secure Payment
                    </p>

                    <p className="
                      text-xs
                      text-gray-500
                      mt-1
                    ">
                      Safe and secure checkout
                    </p>
                  </div>
                </div>

                <div className="
                  flex
                  gap-3
                  items-start
                ">
                  <RotateCcw
                    size={20}
                    className="shrink-0"
                  />

                  <div>
                    <p className="
                      text-sm
                      font-medium
                    ">
                      Easy Returns
                    </p>

                    <p className="
                      text-xs
                      text-gray-500
                      mt-1
                    ">
                      Return policy available
                    </p>
                  </div>
                </div>

              </div>

              {/* STOCK */}

              <div className="py-5">

                <div className="
                  flex
                  items-center
                  justify-between
                  gap-3
                ">

                  <span className="
                    text-sm
                    text-gray-500
                  ">
                    Availability
                  </span>

                  {Number(
                    product?.stock || 0
                  ) > 0 ? (
                    <span className="
                      text-sm
                      font-medium
                      text-black
                    ">
                      In Stock
                    </span>
                  ) : (
                    <span className="
                      text-sm
                      font-medium
                      text-gray-500
                    ">
                      Out of Stock
                    </span>
                  )}

                </div>

                {Number(
                  product?.stock || 0
                ) > 0 && (
                  <p className="
                    text-xs
                    text-gray-400
                    mt-1
                  ">
                    {product.stock} items available
                  </p>
                )}

              </div>

              {/* SIZE */}

              {product?.sizes?.length > 0 && (
                <div className="mb-6">

                  <p className="
                    text-sm
                    font-medium
                    mb-3
                  ">
                    Size
                  </p>

                  <div className="
                    flex
                    gap-2
                    flex-wrap
                  ">

                    {product.sizes.map(
                      (size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() =>
                            setSelectedSize(size)
                          }
                          className={`
                            min-w-[48px]
                            px-4
                            py-2.5
                            text-sm
                            border
                            transition
                            ${
                              selectedSize ===
                              size
                                ? "bg-black text-white border-black"
                                : "bg-white text-gray-700 border-gray-300 hover:border-black"
                            }
                          `}
                        >
                          {size}
                        </button>
                      )
                    )}

                  </div>
                </div>
              )}

              {/* COLOR */}

              {product?.colors?.length > 0 && (
                <div className="mb-6">

                  <p className="
                    text-sm
                    font-medium
                    mb-3
                  ">
                    Color
                  </p>

                  <div className="
                    flex
                    gap-3
                    flex-wrap
                  ">

                    {product.colors.map(
                      (color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() =>
                            setSelectedColor(color)
                          }
                          title={color}
                          className={`
                            w-9
                            h-9
                            rounded-full
                            border
                            transition
                            ${
                              selectedColor ===
                              color
                                ? "ring-2 ring-black ring-offset-2"
                                : "border-gray-300"
                            }
                          `}
                          style={{
                            backgroundColor:
                              color,
                          }}
                        />
                      )
                    )}

                  </div>
                </div>
              )}

              {/* QUANTITY */}

              {Number(
                product?.stock || 0
              ) > 0 && (
                <div className="mb-6">

                  <p className="
                    text-sm
                    font-medium
                    mb-3
                  ">
                    Quantity
                  </p>

                  <div className="
                    flex
                    items-center
                    border
                    border-gray-300
                    w-fit
                  ">

                    <button
                      type="button"
                      onClick={
                        decreaseQuantity
                      }
                      className="
                        w-10
                        h-10
                        flex
                        items-center
                        justify-center
                        hover:bg-gray-100
                      "
                    >
                      <Minus size={16} />
                    </button>

                    <span className="
                      w-12
                      text-center
                      text-sm
                    ">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={
                        increaseQuantity
                      }
                      className="
                        w-10
                        h-10
                        flex
                        items-center
                        justify-center
                        hover:bg-gray-100
                      "
                    >
                      <Plus size={16} />
                    </button>

                  </div>
                </div>
              )}

              {/* BUTTONS */}

              <div className="
                flex
                gap-3
                flex-col
                sm:flex-row
              ">

                <button
                  type="button"
                  onClick={addToCart}
                  disabled={
                    Number(
                      product?.stock || 0
                    ) < 1
                  }
                  className="
                    flex-1
                    py-3.5
                    border
                    border-black
                    bg-white
                    text-black
                    font-medium
                    hover:bg-black
                    hover:text-white
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                    transition
                  "
                >
                  Add to Cart
                </button>

                <button
                  type="button"
                  onClick={buyNow}
                  disabled={
                    Number(
                      product?.stock || 0
                    ) < 1
                  }
                  className="
                    flex-1
                    py-3.5
                    bg-black
                    text-white
                    font-medium
                    hover:bg-gray-800
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                    transition
                  "
                >
                  Buy Now
                </button>

              </div>

            </div>
          </div>
        </div>

     
        {product?.desc && (
          <section className="
            bg-white
            mt-5
            p-5
            md:p-8
          ">

            <h2 className="
              text-lg
              md:text-xl
              font-semibold
              pb-4
              border-b
              border-gray-200
            ">
              Product Details
            </h2>

            <p className="
              mt-5
              text-sm
              text-gray-600
              leading-7
              whitespace-pre-line
            ">
              {product.desc}
            </p>

          </section>
        )}

        {otherProducts.length > 0 && (
          <section className="mt-8">

            <div className="
              bg-white
              px-5
              py-4
              mb-3
              border-b
              border-gray-200
            ">

              <h2 className="
                text-lg
                font-semibold
              ">
                You May Also Like
              </h2>

            </div>

            <div className="
              grid
              grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-6
              gap-3
            ">

              {otherProducts
                .slice(0, 12)
                .map((item) => {

                  const itemImages =
                    Array.isArray(
                      item?.images
                    )
                      ? item.images
                      : [];

                  const index =
                    hoveredIndex[
                      item?._id
                    ] || 0;

                  const imageSrc =
                    itemImages[index] ||
                    itemImages[0] ||
                    "https://github.com/scriptwithahmad/u-shop-2.0/blob/main/public/user.jpeg?raw=true";

                  const itemDiscount =
                    getItemDiscount(item);

                  return (
                    <div
                      key={item?._id}
                      className="
                        bg-white
                        cursor-pointer
                        group
                        overflow-hidden
                        border
                        border-transparent
                        hover:border-gray-300
                        hover:shadow-md
                        transition
                      "
                      onClick={() =>
                        router.push(
                          `/products/${item?._id}`
                        )
                      }
                    >

                      {/* IMAGE */}

                      <div
                        className="
                          relative
                          aspect-square
                          bg-gray-50
                          overflow-hidden
                        "
                        onMouseEnter={() => {
                          if (
                            itemImages.length > 1
                          ) {
                            setHoveredIndex(
                              (prev) => ({
                                ...prev,
                                [item?._id]: 1,
                              })
                            );
                          }
                        }}
                        onMouseLeave={() => {
                          setHoveredIndex(
                            (prev) => ({
                              ...prev,
                              [item?._id]: 0,
                            })
                          );
                        }}
                      >

                        <img
                          src={imageSrc}
                          alt={
                            item?.title ||
                            "Product"
                          }
                          className="
                            w-full
                            h-full
                            object-cover
                            group-hover:scale-105
                            transition-transform
                            duration-300
                          "
                        />

                        {itemDiscount > 0 && (
                          <span className="
                            absolute
                            top-2
                            left-2
                            bg-black
                            text-white
                            text-[10px]
                            px-2
                            py-1
                          ">
                            -{itemDiscount}%
                          </span>
                        )}

                      </div>

                      {/* DETAILS */}

                      <div className="p-3">

                        <h3 className="
                          text-[13px]
                          leading-5
                          text-gray-800
                          line-clamp-2
                          min-h-[40px]
                        ">
                          {item?.title ||
                            "Untitled Product"}
                        </h3>

                        <div className="mt-2">

                          <span className="
                            text-base
                            font-semibold
                            text-black
                          ">
                            Rs.{" "}
                            {Number(
                              item?.price || 0
                            ).toLocaleString()}
                          </span>

                        </div>

                        {item?.originalPrice &&
                          Number(
                            item.originalPrice
                          ) >
                            Number(
                              item.price
                            ) && (
                            <div className="
                              flex
                              gap-2
                              mt-1
                            ">

                              <span className="
                                text-xs
                                text-gray-400
                                line-through
                              ">
                                Rs.{" "}
                                {Number(
                                  item.originalPrice
                                ).toLocaleString()}
                              </span>

                              {itemDiscount > 0 && (
                                <span className="
                                  text-xs
                                  text-gray-500
                                ">
                                  -{itemDiscount}%
                                </span>
                              )}

                            </div>
                          )}

                        <p className="
                          text-[11px]
                          text-gray-400
                          mt-2
                        ">
                          Free Delivery
                        </p>

                      </div>

                    </div>
                  );
                })}

            </div>
          </section>
        )}

      </div>
    </div>
  );
}