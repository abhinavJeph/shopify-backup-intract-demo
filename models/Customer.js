const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, index: true, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
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

const Customer = mongoose.model("Customer", CustomerSchema);
module.exports = Customer;
