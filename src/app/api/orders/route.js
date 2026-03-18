import db from "@/Backend/db"
import { Order, Product } from "@/Backend/models"
import { NextResponse } from "next/server"

export async function GET(){

await db()

try{

const orders = await Order
.find()
.populate("items.product")
.sort({createdAt:-1})

return NextResponse.json({
success:true,
orders
})

}catch(error){

return NextResponse.json({
success:false,
error:error.message
})

}

}



export async function POST(req){

await db()

try{

const body = await req.json()

const {customer,items,paymentMethod} = body

if(!customer || !items || items.length === 0){
return NextResponse.json({
success:false,
message:"Invalid order data"
},{status:400})
}

let total = 0
let orderItems = []

for(const item of items){

const product = await Product.findById(item.product)

if(!product){
return NextResponse.json({
success:false,
message:"Product not found"
},{status:404})
}

if(product.stock < item.qty){
return NextResponse.json({
success:false,
message:`${product.title} is out of stock`
},{status:400})
}

product.stock -= item.qty
await product.save()

total += product.price * item.qty

orderItems.push({
product:product._id,
title:product.title,
price:product.price,
size:item.size,
color:item.color,
qty:item.qty
})

}

const order = await Order.create({

customer,
items:orderItems,
total,

paymentMethod:paymentMethod || "COD",
paymentStatus:"unpaid",
status:"pending"

})

return NextResponse.json({
success:true,
order
})

}catch(error){

return NextResponse.json({
success:false,
error:error.message
},{status:500})

}

}