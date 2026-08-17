import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import db from "@/Backend/db"
import { UserModel } from "@/Backend/models"

export async function GET(){

await db()

const users = await UserModel
.find()
.select("-password")

return NextResponse.json({
success:true,
users
})

}

export async function PUT(req){

await db()

const {userName,fullName,password,role} = await req.json()

const updateData={fullName,role}

if(password){
updateData.password = await bcrypt.hash(password,10)
}

const updated = await UserModel
.findOneAndUpdate({userName},updateData,{new:true})
.select("-password")

if(!updated){
return NextResponse.json({
success:false,
message:"User not found"
},{status:404})
}

return NextResponse.json({
success:true,
user:updated
})

}