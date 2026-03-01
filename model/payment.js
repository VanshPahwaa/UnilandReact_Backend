const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  idempotencyKey: { type: String, unique: true },
  amount: Number,
  paymentGateway: String,
  paymentGatewayOrderId: String,
  paymentGatewayPaymentId: String,
  status: {
    type: String,
    enum: ["PENDING", "FAILED", "SUCCESS"],
    default: "PENDING"
  },
  leadData: Object,
}, { timestamps: true }); 

module.exports = mongoose.model("Payment", paymentSchema);