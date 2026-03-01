const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  clientName: String,
  email: String,
  mobileNumber: String,
  preferredTime: String,
  preferredDate: String,
  assigned:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  },

  transactionId: String,

  status: {
    type: String,
    enum: ["CONFIRMED", "CANCELLED"],
    default: "CONFIRMED",
  },
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);