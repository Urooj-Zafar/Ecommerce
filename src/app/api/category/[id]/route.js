import db from "@/Backend/db"
import { Category } from "@/Backend/models"
import { NextResponse } from "next/server"
export async function DELETE(req,{params}) {
    await db();
    try {
        const {id}= await params;
        const cat = await Category.findByIdAndDelete(id);
        return new Response({
                message:"Category deleted successfully!"
            },{
                status:201,
            })
    } catch (error) {
        return new Response(
           null,{status:500}
        )
    }
}
export async function GET(_, {params}){
    await db();
    try{
        const {id} = await params;
        const cat = await Category.findById(id);
        return Response.json(cat);
    }
    catch(error){
        if(!cat) {
        return Response.json(
            {
                error:"Category not exist"
            },{
                status:404,
            }
        );
    }
    }
}
export async function PUT(req, {params}){
    await db();
    try{
        const editCat = await req.json();
        const {id} = await params;
        const cat = await Category.findByIdAndUpdate(id, editCat, {new: true,});
        return Response.json({
                message:"Category updated successfully!"
            },{
                status:201,
            });
    }
    catch(error){
        if(!cat) {
        return Response.json(
            {
                error:"Category not exist"
            },{
                status:404,
            }
        );
    }
    }
}