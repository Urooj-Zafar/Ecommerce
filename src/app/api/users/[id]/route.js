import db from "@/Backend/db"
import { UserModel } from "@/Backend/models"
import { NextResponse } from "next/server"

export async function DELETE(req,{params}){

await db()

try{

const {id} = params

const user = await UserModel.findByIdAndDelete(id)

if(!user){
return NextResponse.json({
success:false,
message:"User not found"
},{status:404})
}

return NextResponse.json({
success:true,
message:"User deleted"
})

}catch(err){

return NextResponse.json({
success:false,
message:err.message
})

}

}