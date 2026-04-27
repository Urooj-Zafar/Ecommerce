
// import dbConnect from "@/backend/db";
// import { Product } from "@/backend/models";
import { NextResponse } from "next/server";

export async function DELETE(req,{params}) {
    await dbConnect()
    try {
        const {id}= params
        const deleteProduct = await Product.findByIdAndDelete(id)
         return NextResponse.json(
                    {deleteProduct,success:true},
                    {Status:200}
                )
    } catch (error) {
         return NextResponse.json(
            {error:error},
            {Status:500}
        )
    }
    
}


export async function GET(req,{params}) {
    await dbConnect()
    try {
        const id= params.id
        const single = await Product.findById(id)
         return NextResponse.json(
                    {single,success:true},
                    {Status:200}
                )
    } catch (error) {
         return NextResponse.json(
            {error:error},
            {Status:500}
        )
    }
    
}

export async function PUT(req,{params}) {
    await dbConnect()
    try {
        const id= params.id
        const data = await req.json()
        const update = await Product.findByIdAndUpdate(id,data,{new:true})
         return NextResponse.json(
                    {update,success:true},
                    {Status:200}
                )
    } catch (error) {
         return NextResponse.json(
            {error:error},
            {Status:500}
        )
    }
    
}
