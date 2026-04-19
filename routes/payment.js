const express = require("express");
const app = express();
const router = express.Router();
require("dotenv").config();
const Razorpay = require("razorpay");
const Appointment = require("./appointments");
const Payment=require("../model/payment");


//RAZORPAY

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


function generateTransactionId() {
  return "PAY-" + Date.now();
}

router.post("/initiate", async (req, res) => {
  try {
    const { amount, paymentGateway, idempotencyKey, lead } = req.body;

    if (!amount || !paymentGateway || !idempotencyKey) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let payment = await Payment.findOne({ idempotencyKey });

  
    if (payment) {

      if (payment.status === "SUCCESS") {
        return res.json({
          success: true,
          alreadyPaid: true,
        });
      }

      if (payment.status === "PENDING") {
        return res.json({
          success: true,
          gateway: payment.paymentGateway,
          order: {
            id: payment.paymentGatewayOrderId,
            amount: payment.amount * 100,
          },
        });
      }

      if (payment.status === "FAILED") {
        // Allow retry & gateway switch
        payment.paymentGateway = paymentGateway;
        payment.status = "PENDING";
      }

    } else {
      payment = await Payment.create({
        idempotencyKey,
        amount,
        paymentGateway,
        leadData: lead,
        status: "PENDING",
      });
    }

    // ================== RAZORPAY ==================
    if (paymentGateway === "razorpay") {

      const order = await razorpay.orders.create({
        amount: Number(amount) * 100,
        currency: "INR",
        receipt: payment._id.toString(),
        notes: { paymentId: payment._id.toString() }
      });

      payment.paymentGatewayOrderId = order.id;
      await payment.save();

      return res.json({
        success: true,
        gateway: "razorpay",
        order
      });
    }

    return res.status(400).json({
      success: false,
      message: "Unsupported gateway",
    });

  } catch (error) {
    console.error("Initiate error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/razorpay-verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      idempotencyKey,
    } = req.body;

    const payment = await Payment.findOne({ idempotencyKey });

    if (!payment) {
      return res.status(400).json({
        success: false,
        message: "Payment session not found",
      });
    }

    if (payment.status === "SUCCESS") {
      return res.json({
        success: true,
        message: "Payment already verified",
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      payment.status = "FAILED";
      await payment.save();

      return res.json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // 🔥 SUCCESS
    payment.status = "SUCCESS";
    payment.paymentGatewayPaymentId = razorpay_payment_id;
    await payment.save();

    // 🏗 Create appointment AFTER success
    await Appointment.create({
      ...payment.leadData,
      paymentId: payment._id,
      status: "CONFIRMED",
      transactionId: "TXN_" + Date.now(),
    });

    res.json({
      success: true,
      message: "Payment successful & appointment booked",
    });

  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


module.exports=router;