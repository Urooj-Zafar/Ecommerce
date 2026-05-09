import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"]
    },

    desc: {
      type: String,
      required: [true, "Product description is required"],
    },

    images: Array,

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categories",
      required: [true, "Category is required"],
    },

    price: {
      type: Number
    },

    stock: {
      type: Number
    },
  },
  {
    timestamps: true,
  }
);

const Product= mongoose.models.Products ||
  mongoose.model("Products", productSchema);
  export default Product;
