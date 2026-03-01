const express = require("express");
const app = express();
const router = express.Router();
require("dotenv").config();
const Razorpay = require("razorpay");
const Appointment = require("../../model/appointments");
const Payment=require("../../model/payment")


//RAZORPAY

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});



// ================== HELPER ==================
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

    // ================== EXISTING PAYMENT ==================
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


// Route to create Razorpay order with idempotency checking
// router.post("/razorpay-create-order", async (req, res) => {
//   try {
//     const { amount, idempotencyKey } = req.body;


//     // Validate idempotency key if provided
//     if (idempotencyKey) {
//       const idempotencyCheck = await validateIdempotencyKey(idempotencyKey);
      
//       if (!idempotencyCheck.valid) {
//         return res.status(400).json({
//           success: false,
//           message: idempotencyCheck.message,
//           shouldCreateNew: idempotencyCheck.shouldCreateNew
//         });
//       }

//       // If appointment exists and can be reused, return existing appointment info
//       if (idempotencyCheck.canReuse && idempotencyCheck.appointment) {
//         console.log("Reusing existing appointment with idempotency key:", idempotencyKey);
        
//         return res.json({
//           success: true,
//           message: "Using existing appointment for order creation",
//           appointmentId: idempotencyCheck.appointment._id,
//           idempotencyKey: idempotencyCheck.appointment.idempotencyKey,
//           transactionId: idempotencyCheck.appointment.transactionId,
//           appointmentStatus: idempotencyCheck.appointment.status,
//           canProceedWithPayment: true
//         });
//       }
//     }

//     // Create new Razorpay order if appointment is valid or no idempotency key
//     const currency = "INR";
//     const options = {
//       amount: Number(amount) * 100, // in paise
//       currency: currency,
//       receipt: `receipt_order_${Date.now()}`,
//       notes: {
//         idempotencyKey: idempotencyKey || "no-key"
//       }
//     };

//     const order = await razorpay.orders.create(options);
//     console.log("Razorpay order created:", order.id);

//     res.json({
//       success: true,
//       ...order,
//       idempotencyKey: idempotencyKey
//     });
//   } catch (err) {
//     console.error("Razorpay Create Order Error:", err);
//     res.status(500).json({ 
//       success: false,
//       error: err.message || "Something went wrong" 
//     });
//   }
// });


// // Route to verify payment signature with idempotency
// router.post("/razorpay-verify", async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       user,
//       idempotencyKey,
//     } = req.body;
//     console.log("Razorpay Verify Request:", req.body);

//     // Verify signature
//     const sign = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSign = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(sign.toString())
//       .digest("hex");

//     let appointment;

//     // If idempotency key exists, try to find existing appointment
//     if (idempotencyKey) {
//       appointment = await Appointment.findOne({ idempotencyKey });

//       if (appointment) {
//         // Appointment exists, update it with payment details
//         appointment.paymentGatewayId = razorpay_order_id;
//         appointment.paymentId = razorpay_payment_id;

//         if (razorpay_signature === expectedSign) {
//           // Payment signature is valid
//           appointment.status = "PAID";
//           await appointment.save();

//           return res.json({
//             status: "success",
//             success: true,
//             message:
//               "Payment verified successfully (using existing appointment)",
//             appointmentId: appointment._id,
//             transactionId: appointment.transactionId,
//           });
//         } else {
//           // Payment signature failed
//           appointment.status = "FAILED";
//           await appointment.save();

//           return res.json({
//             status: "failed",
//             success: false,
//             message: "Payment verification failed (signature mismatch)",
//             appointmentId: appointment._id,
//           });
//         }
//       }
//     }

//     // No existing appointment, create a new one
//     appointment = await Appointment.create({
//       ...user,
//       paymentGatewayId: razorpay_order_id,
//       paymentId: razorpay_payment_id,
//       transactionId: generateTimeBasedPaymentId(),
//       idempotencyKey: idempotencyKey || uuidv4(),
//       status: "PENDING",
//     });

//     if (razorpay_signature === expectedSign) {
//       // Payment verified
//       appointment.status = "PAID";
//       await appointment.save();

//       console.log("Appointment created and verified:", appointment);
//       res.json({
//         status: "success",
//         success: true,
//         message: "Payment verified successfully",
//         appointmentId: appointment._id,
//         transactionId: appointment.transactionId,
//       });
//     } else {
//       // Payment verification failed
//       await appointment.save();
//       console.log("Payment signature mismatch");

//       res.json({
//         status: "failed",
//         success: false,
//         message: "Payment verification failed",
//         appointmentId: appointment._id,
//       });
//     }
//   } catch (error) {
//     console.error("Razorpay Verify Error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Payment verification failed",
//       status: "error",
//     });
//   }
// });

























































const stripe = require("stripe")(
  "sk_test_51RmAZ7GfOiTah1pJjsnhK6Aa4aRlC96TIQ4xNlAuewrlcvCaOe480LWyJNZgbit16PfX8mwfTXgdPFmd47wie67400JGWwA80w",
);
STRIPE_PUBLISHABLE_KEY =
  "pk_test_51RmAZ7GfOiTah1pJQyhwnwtvBQeIpzIzz4KDqaHdCRf09LEHTavWeZ3uasrH82MBlAnWBvufeKDnIVQb8tNMGDKk00KXboHjdY";

const bodyParser = require("body-parser");
const crypto = require("crypto");

app.use(bodyParser.json());
const { v4: uuidv4 } = require("uuid");

const PAYPAL_MODE = "sandbox";
const PAYPAL_CLIENT_KEY =
  "ASkGkvajTc8GtanIN1s2zbl1WLAQ1AyLcR3nxU64rZH9vBm9-zE4rl9eJrYkJd9orOy7LSjRT5o9Bg-2";
const PAYPAL_SECRET_KEY =
  "EEwm4vAZeTudJuhB6KZmnH_VMd-EIFu2EIAe4k9gTFQXmbmFIwy3XrGyFmyBAD0vAGYL7r6qT42B9aBE";

// FOR PAYPAL
const paypal = require("@paypal/checkout-server-sdk");

// Configure environment (Sandbox for testing)
// let clientId = "YOUR_PAYPAL_CLIENT_ID";
// let clientSecret = "YOUR_PAYPAL_SECRET";

let environment = new paypal.core.SandboxEnvironment(
  PAYPAL_CLIENT_KEY,
  PAYPAL_SECRET_KEY,
);
let client = new paypal.core.PayPalHttpClient(environment);
const axios = require("axios");





















































function generateTimeBasedPaymentId() {
  const prefix = "PAY";
  const timestamp = Date.now(); // milliseconds since Jan 1, 1970
  return `${prefix}-${timestamp}`;
}

// ===== IDEMPOTENCY KEY MANAGEMENT =====
// Route to create initial appointment order with idempotency key
router.post("/create-appointment", async (req, res) => {
  try {
    const {
      clientName,
      email,
      mobileNumber,
      preferredTime,
      preferredDate,
      paymentGateway,
    } = req.body;

    // Validate required fields
    if (
      !clientName ||
      !email ||
      !mobileNumber ||
      !preferredTime ||
      !preferredDate ||
      !paymentGateway
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Generate a unique idempotency key for this appointment
    const idempotencyKey = uuidv4();

    // Create the appointment with CREATED status
    const appointment = await Appointment.create({
      clientName,
      email,
      mobileNumber,
      preferredTime,
      preferredDate,
      paymentGateway,
      status: "CREATED",
      idempotencyKey,
      transactionId: generateTimeBasedPaymentId(),
    });

    res.status(201).json({
      success: true,
      message: "Appointment order created successfully",
      data: {
        appointmentId: appointment._id,
        idempotencyKey: appointment.idempotencyKey,
        transactionId: appointment.transactionId,
        status: appointment.status,
      },
    });
  } catch (error) {
    console.error("Create Appointment Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create appointment",
    });
  }
});

// Helper function to validate idempotency key
async function validateIdempotencyKey(idempotencyKey) {
  if (!idempotencyKey) {
    return {
      valid: false,
      message: "Idempotency key is required"
    };
  }

  const existingAppointment = await Appointment.findOne({ idempotencyKey });

  if (!existingAppointment) {
    return {
      valid: false,
      message: "Appointment not found with this idempotency key",
      shouldCreateNew: true
    };
  }

  // Check if appointment status is CREATED or PENDING (can be reused)
  if (existingAppointment.status === "CREATED" || existingAppointment.status === "PENDING") {
    return {
      valid: true,
      message: "Existing appointment found, will be reused",
      appointment: existingAppointment,
      canReuse: true
    };
  } else {
    // Status is PAID or FAILED - need a new appointment
    return {
      valid: false,
      message: `Appointment cannot be reused, current status is ${existingAppointment.status}`,
      shouldCreateNew: true,
      canReuse: false
    };
  }
}




router.post("/stripe-checkout-session", async (req, res) => {
  console.log(req.body);
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Agent Fee",
          },
          unit_amount: 1000,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: process.env.CLIENT_URL + `payment-success`,
    cancel_url: process.env.CLIENT_URL + `payment-failed`,
  });

  //    res.redirect(303, session.url);
  res.json({ id: session.id });
  //   res.send({clientSecret: session.client_secret});
});

// router.post("/paypal-checkout-order", async (req, res) => {
//   const { amount } = req.body;
//   const request = new paypal.orders.OrdersCreateRequest();
//   request.prefer("return=representation");
//   request.requestBody({
//     intent: "CAPTURE",
//     purchase_units: [{
//       amount: {
//         currency_code: "USD",
//         value: amount // Amount to be paid
//       }
//     }]
//   });

//   try {
//     const order = await client.execute(request);
//     res.json({ id: order.result.id });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send(err);
//   }
// });

// router.post("/capture-order", async (req, res) => {
//   const { orderID } = req.body;
//   console.log(req.body)

//   const request = new paypal.orders.OrdersCaptureRequest(orderID);
//   request.requestBody({});
//   let paymentId = ""
//   console.log("in paypal capture order")

//   try {
//     const capture = await client.execute(request);

//     paymentId = generateTimeBasedPaymentId();
//     // Step 1: Create appointment with status "PENDING"
//     let appointment = await Appointment.create({
//       ...req.body.user,
//       paymentGatewayId: orderID,
//       transactionId: paymentId,
//       status: "PENDING"
//     });

//     console.log("Appointment created with status PENDING:", appointment);

//     if (capture.result.status === "COMPLETED") {

//       // Update appointment status to "PAID" and set paymentId
//       appointment.status = "PAID";

//       console.log("Appointment updated to PAID:", appointment);
//       console.log("Payment successful");

//       // Random address and test card info
//       // Address: 47 W 13th St, New York, NY 10011, USA
//       // Test Card: 5555 5555 5555 4444
//     }
//     await appointment.save();

//     console.log(capture.result)
//     res.json({ result: capture.result, transactionId: paymentId });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, error: err, transactionId: paymentId });
//   }
// });

router.post("/paypal-checkout-order", async (req, res) => {
  const { amount } = req.body;
  try {
    // Get access token
    const auth = Buffer.from(
      `${PAYPAL_CLIENT_KEY}:${PAYPAL_SECRET_KEY}`,
    ).toString("base64");

    const { data: tokenRes } = await axios.post(
      `https://api-m.sandbox.paypal.com/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    // Create order
    const { data: order } = await axios.post(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount, // or INR if your account supports it
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${tokenRes.access_token}`,
          "Content-Type": "application/json",
        },
      },
    );
    console.log(order);
    res.json(order);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create PayPal order" });
  }
});

// Capture order after approval
router.post("/paypal-capture/:orderId", async (req, res) => {
  const { orderId } = req.params;
  // const { userId } = req.body; // pass from frontend if needed

  try {
    // 1️⃣ Get PayPal access token
    const auth = Buffer.from(
      `${PAYPAL_CLIENT_KEY}:${PAYPAL_SECRET_KEY}`,
    ).toString("base64");

    console.log("online payment capture");
    const { data: tokenRes } = await axios.post(
      `https://api-m.sandbox.paypal.com/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    // 2️⃣ Capture order
    const { data: capture } = await axios.post(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${tokenRes.access_token}`,
          "Content-Type": "application/json",
        },
      },
    );

    // 3️⃣ Verify PayPal response
    if (capture.status === "COMPLETED") {
      // 4️⃣ Update your DB
      // Example: MongoDB / Mongoose
      console.log("db updated here");
      // await Appointment.updateOne(
      //   { paymentGatewayId: orderId },
      //   {
      //     $set: {
      //       status: "PAID",
      //       updatedAt: new Date(),
      //     },
      //   }
      // );
    }

    res.json({ success: true, capture });
  } catch (err) {
    console.error("PayPal capture error:", err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

const MERCHANT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const MERCHANT_ID = "PGTESTPAYUAT86";

// const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay"
// const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/status"

const MERCHANT_BASE_URL =
  "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
const MERCHANT_STATUS_URL =
  "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status";

const redirectUrl = "http://localhost:5000/payment/status";

const successUrl = "http://localhost:8080/paymentStatus";
const failureUrl = "http://localhost:8080/paymentStatus";

router.post("/phonepe-checkout-order", async (req, res) => {
  const { lead, amount } = req.body;
  console.log(req.body);
  const orderId = uuidv4();

  //payment
  const paymentPayload = {
    merchantId: MERCHANT_ID,
    merchantUserId: lead.clientName,
    mobileNumber: lead.mobileNumber,
    amount: Number(amount) * 100,
    merchantTransactionId: orderId,
    redirectUrl: `${redirectUrl}?id=${orderId}`,
    redirectMode: "GET",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  const payload = Buffer.from(JSON.stringify(paymentPayload)).toString(
    "base64",
  );
  const keyIndex = 1;
  const string = payload + "/pg/v1/pay" + MERCHANT_KEY;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const option = {
    method: "POST",
    url: MERCHANT_BASE_URL,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
    },
    data: {
      request: payload,
    },
  };
  try {
    const response = await axios.request(option);
    console.log(response.data.data.instrumentResponse.redirectInfo.url);
    const paymentId = generateTimeBasedPaymentId();
    let appointment = await Appointment.create({
      ...req.body.lead,
      transactionId: paymentId,
      paymentGatewayId: orderId,
      paymentGateway: "phonepe",
      status: "PENDING",
    });
    await appointment.save();
    res
      .status(200)
      .json({
        msg: "OK",
        success: true,
        url: response.data.data.instrumentResponse.redirectInfo.url,
        transactionid: paymentId,
      });
  } catch (error) {
    console.log("error in payment", error);
    res.status(500).json({ error: error.message });
  }
});

router.all("/status", async (req, res) => {
  console.log("in phonepe testing status", req.query);
  const merchantTransactionId = req.query.id;
  const keyIndex = 1;
  const string =
    `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + MERCHANT_KEY;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const option = {
    method: "GET",
    url: `${MERCHANT_STATUS_URL}/${MERCHANT_ID}/${merchantTransactionId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": MERCHANT_ID,
    },
  };
  console.log("outside axios");
  let appointment = null;
  axios.request(option).then(async (response) => {
    console.log("in phonepe", response);
    if (response.data.success === true) {
      appointment = await Appointment.findOneAndUpdate(
        { paymentGatewayId: merchantTransactionId },
        { status: "PAID" },
        { new: true },
      );

      // console.log(appointment)
      return res.json({
        success: true,
        message: "Payment Completed Successfully",
      });
    } else {
      return res.json({
        success: false,
        message: "Payment Failed",
      });
    }
  });
});

// const MERCHANT_ID='PGTESTPAYUAT86'
// const SALT_KEY='96434309-7796-489d-8924-ab56988a6076'
// const SALT_INDEX=1

// router.post("/phonepe-checkout-order", async (req, res) => {
//     // const { userId, amount } = req.body;

//     const merchantId = MERCHANT_ID;
//     const transactionId = "txn_" + Date.now();
//     const saltKey = SALT_KEY;
//     const saltIndex = SALT_INDEX; // Provided by PhonePe

//     const payload = {
//       merchantId,
//       transactionId,
//       merchantUserId: '123',
//       amount: 1000 * 100, // in paise
//       redirectUrl: "http://localhost:8080/payment-success",
//       redirectMode: "POST",
//       callbackUrl: "http://localhost:8080/backend/payment/phone-callback",
//       paymentInstrument: {
//         type: "PAY_PAGE"
//       }
//     };

//     console.log("phone checkout")
//     const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");
//     const checksum = crypto
//         .createHash("sha256")
//         .update(payloadBase64 + "/pg/v1/pay" + saltKey)
//         .digest("hex") + "###" + saltIndex;

//     try {
//         const response = await axios.post(
//             "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pa",
//             { request: payloadBase64 },
//             { headers: { "X-VERIFY": checksum, "Content-Type": "application/json" } }
//         );

//         const url = response.data.data.instrumentResponse.redirectInfo.url;
//         res.json({ url });
//     } catch (err) {
//         console.error(err.response?.data || err.message);
//         res.status(500).json({ error: "PhonePe Init Error", details: err.response?.data });
//     }
// });

// router.post("/phonepe-callback", async (req, res) => {
//     const data = req.body;

//     // ✅ Always verify checksum for security
//     const { transactionId, code, message, amount } = data;

//     if (code === "PAYMENT_SUCCESS") {
//         // Update DB: order paid
//         console.log("updated Db, payment successfull")
//         // await Order.updateOne({ transactionId }, { status: "PAID" });
//     } else {
//         // Update DB: payment failed
//       console.log("failed payment")
//         // await Order.updateOne({ transactionId }, { status: "FAILED" });
//     }
//     res.json({ success: true });
// });

// Webhook endpoint
router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];
    console.log("in stripe webhooks");
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.log("⚠️ Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event type
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      // ✅ Payment is successful and checkout session is completed
      // Update your DB here
      console.log("Payment Success: in webhook", session);

      // Example: save to DB
      // await Order.update({ status: "paid" }, { where: { sessionId: session.id } });
    }

    res.json({ received: true });
  },
);

module.exports = router;
