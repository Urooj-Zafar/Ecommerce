import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import db from "@/Backend/db"
import { UserModel } from "@/Backend/models"


export async function POST(req){

await db()

const {fullName,userName,password,role} = await req.json()

if(!fullName || !userName || !password){
return NextResponse.json({
success:false,
message:"Fill all fields"
},{status:400})
}

const exist = await UserModel.findOne({userName})

if(exist){
return NextResponse.json({
success:false,
message:"Username already exists"
},{status:409})
}

const hash = await bcrypt.hash(password,10)

const user = await UserModel.create({
fullName,
userName,
password:hash,
role:role || "user"
})

return NextResponse.json({
success:true,
user
},{status:201})

}



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