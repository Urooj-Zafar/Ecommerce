import db from "@/Backend/db"
import { Order, Product } from "@/Backend/models"
import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

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


const transporter = nodemailer.createTransport({
service:"gmail",
auth:{
user:"urooj73920@gmail.com",
pass:process.env.EMAIL_PASS
}
})

const mailOptions = {
from:"urooj73920@gmail.com",
to:customer.email,
subject:"Order Confirmation",
html:`
<h2>Order Confirmed</h2>

<p>Hi ${customer.name},</p>

<p>Your order has been placed successfully.</p>

<h3>Order Summary:</h3>

<ul>
${orderItems.map(item=>`
<li>
${item.title} <br/>
Size: ${item.size} <br/>
Color: ${item.color} <br/>
Qty: ${item.qty} <br/>
Price: $${item.price}
</li>
`).join("")}
</ul>

<h3>Total: $${total}</h3>

<p><b>Payment Method:</b> ${paymentMethod || "COD"}</p>

<p><b>Shipping Address:</b><br/>
${customer.address}, ${customer.city}
</p>

<br/>
<p>Thank you for your order.</p>
`
}

try{
await transporter.sendMail(mailOptions)
}catch(emailError){
console.log("Email failed:", emailError.message)
}

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