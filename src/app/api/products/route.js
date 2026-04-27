import db from "@/Backend/db";
import { Product } from "@/Backend/models";
import { NextResponse } from "next/server";

export async function POST(req) {
  await db();

  try {
    const data = await req.json();

    const pro = await Product.create(data);

    return NextResponse.json(
      {
        products: pro,
        success: true
      },
      { status: 201 }
    );

  } catch (error) {
  console.log("POST /api/products error:", error);
  return NextResponse.json(
    { error: error.message, success: false },
    { status: 500 }
  );
}
}

export async function GET() {
  await db();

  try {
    const pro = await Product.find().populate("category");

    return NextResponse.json(
      {
        products: pro,
        success: true
      },
      { status: 200 }
    );

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        error: error.message,
        success: false
      },
      { status: 500 }
    );
  }
}