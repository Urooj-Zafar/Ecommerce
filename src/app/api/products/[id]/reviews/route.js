import db from "@/Backend/db";
import { Product } from "@/Backend/models";
import { VerifyToken } from "@/helper/jwt";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    await db();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required",
        },
        { status: 400 }
      );
    }

    const token = req.cookies.get("EliteShop")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to review this product",
        },
        { status: 401 }
      );
    }

    const user = VerifyToken(token);

    if (!user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired session",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const rating = Number(body.rating);
    const comment =
      typeof body.comment === "string"
        ? body.comment.trim()
        : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be between 1 and 5",
        },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    // Make sure reviews always exists
    if (!Array.isArray(product.reviews)) {
      product.reviews = [];
    }

    const userId = user.id.toString();

    const existingReviewIndex = product.reviews.findIndex(
      (review) =>
        review.user &&
        review.user.toString() === userId
    );

    if (existingReviewIndex !== -1) {
      // Update existing review
      product.reviews[existingReviewIndex].rating = rating;
      product.reviews[existingReviewIndex].comment = comment;
      product.reviews[existingReviewIndex].createdAt =
        new Date();
    } else {
      // Add new review
      product.reviews.push({
        user: user.id,
        rating,
        comment,
        createdAt: new Date(),
      });
    }

    // Recalculate rating
    const totalRating = product.reviews.reduce(
      (sum, review) =>
        sum + Number(review.rating || 0),
      0
    );

    product.reviewsCount = product.reviews.length;

    product.rating =
      product.reviewsCount > 0
        ? Number(
            (
              totalRating /
              product.reviewsCount
            ).toFixed(1)
          )
        : 0;

    await product.save();

    // Get updated product
    const updatedProduct = await Product.findById(id)
      .populate(
        "reviews.user",
        "fullName userName"
      )
      .lean();

    return NextResponse.json({
      success: true,
      message:
        existingReviewIndex !== -1
          ? "Review updated successfully"
          : "Review added successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("REVIEW POST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to submit review",
      },
      { status: 500 }
    );
  }
}

export async function GET(req, { params }) {
  try {
    await db();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required",
        },
        { status: 400 }
      );
    }

    const product = await Product.findById(id)
      .select(
        "rating reviewsCount reviews"
      )
      .populate(
        "reviews.user",
        "fullName userName"
      )
      .lean();

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      rating: Number(product.rating || 0),
      reviewsCount: Number(
        product.reviewsCount ||
          product.reviews?.length ||
          0
      ),
      reviews: Array.isArray(product.reviews)
        ? product.reviews
        : [],
    });
  } catch (error) {
    console.error(
      "REVIEWS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to fetch reviews",
      },
      { status: 500 }
    );
  }
}