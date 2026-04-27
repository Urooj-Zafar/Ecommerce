import db from "@/Backend/db";
import { Category } from "@/Backend/models";
import { NextResponse } from "next/server";

export async function POST(req) {
    await db()
    try {
        const data = await req.json()
        const cat = await Category.create(data)
        return NextResponse.json(
            {
                Category:cat,
                success:true
            },{status:201}
        )
        
    } catch (error) {
        return NextResponse.json(
            {
                error:error,
                success:false
            },{status:500}
        )
    }
}
export async function GET(req) {
    await db()
    try {
        const cat = await Category.find()
        return NextResponse.json(
            {
                Category:cat,
                success:true
            },{status:201}
        )
        
    } catch (error) {
        return NextResponse.json(
            {
                error:error,
                success:false
            },{status:500}
        )
    }
}