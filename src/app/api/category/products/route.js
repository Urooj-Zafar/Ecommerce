
// import dbConnect from "@/backend/db";
// import { NextResponse } from "next/server";
// import { Product,Category } from "@/backend/models";


export async function POST(req) {
    try {
        const data = await req.json();
        await dbConnect();
        const product = await Product.create(data);
        return NextResponse.json(       
            {product, message: "Product Created Successfully", success: true}, 
            {status: 201}
        ); 
        
    } catch (error) {
        if(error.code === 11000) {
            return NextResponse.json(
                {error:"Product with this title already exists"},
                {status: 400}
            )
        }
        return NextResponse.json(
            {error:error},
            {Status:500}
        )
    }
    
}

export async function GET(req) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    if (category) {
      query["category"] = category;
    }

    if (search) {
      query["title"] = { $regex: search, $options: "i" }; // case-insensitive
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json(
      {
        products,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        success: true,
        message: "Products fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch products",
        error: error.message,
        success: false,
      },
      { status: 500 }
    );
  }
}



