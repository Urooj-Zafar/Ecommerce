import mongoose from "mongoose";

// CATEGORY
const categorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);
export const Category =
  mongoose.models.Categories || mongoose.model("Categories", categorySchema);

// PRODUCT
const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    desc: { type: String, required: true },
    images: { type: [String], default: [] },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Categories", required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
  },
  { timestamps: true }
);
export const Product =
  mongoose.models.Products || mongoose.model("Products", productSchema);

// USER
const userSchema = new mongoose.Schema({
  fullName:{type:String,required:true},
  userName:{type:String,required:true,unique:true},
  email:{type:String,unique:true},
  password:{type:String,required:true},
  role:{type:String,enum:["user","admin"],default:"user"},
  photo:{type:String,default:""}
},{timestamps:true});
export const UserModel =
  mongoose.models.User || mongoose.model("User", userSchema);

// ORDER
const orderSchema = new mongoose.Schema({

customer:{
name:String,
email:String,
address:String,
city:String
},

items:[
{
product:{
type:mongoose.Schema.Types.ObjectId,
ref:"Products"
},
title:String,
price:Number,
size:String,
color:String,
qty:Number
}
],

total:Number,

paymentMethod:{
type:String,
default:"COD"
},

paymentStatus:{
type:String,
default:"unpaid"
},

status:{
type:String,
enum:["pending","shipped","delivered","cancelled"],
default:"pending"
}

},{timestamps:true})
export const Order =
mongoose.models.Orders || mongoose.model("Orders",orderSchema)