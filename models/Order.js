const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true, required: true },
    currency: { type: String, required: true },
    total_price: { type: String, required: true },
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
const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;
