const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true, required: true },
    title: { type: String, required: true },
    pageDetails: {
      link: { type: String, required: true },
      count: { type: Number, required: true },
      percentage: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
