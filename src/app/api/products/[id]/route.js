import db from "@/Backend/db"
import { Product } from "@/Backend/models"
export async function DELETE(req,{params}) {
    await db();
    try {
        const {id}= await params;
        const pro = await Product.findByIdAndDelete(id);
        return new Response({
                message:"Product deleted successfully!"
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
        const pro = await Product.findById(id);
        return Response.json(pro);
    }
    catch(error){
        if(!pro) {
        return Response.json(
            {
                error:"Product not exist"
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
        const editPro = await req.json();
        const {id} = await params;
        const pro = await Product.findByIdAndUpdate(id, editPro, {new: true,});
        return Response.json({
                message:"Product updated successfully!"
            },{
                status:201,
            })
    }
    catch(error){
        if(!pro) {
        return Response.json(
            {
                error:"Product not exist"
            },{
                status:404,
            }
        );
    }
    }
}