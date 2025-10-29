require("dotenv").config();
console.log("Stripe key:", process.env.STRIPE_SECRET_KEY);
const Stripe=require("stripe")
const stripe = new Stripe("sk_test_51RmAZ7GfOiTah1pJjsnhK6Aa4aRlC96TIQ4xNlAuewrlcvCaOe480LWyJNZgbit16PfX8mwfTXgdPFmd47wie67400JGWwA80w");


// Run once at app startup (or via admin route)
async function setupWebhook() {
  try {
    const webhookEndpoint = await stripe.webhookEndpoints.create({
      url: "https://774bd47a5285.ngrok-free.app/backend/payment/stripe-webhook",
      enabled_events: [
        "checkout.session.completed",
        "payment_intent.succeeded",
        "payment_intent.payment_failed"
      ],
    });

    console.log("✅ Webhook created:", webhookEndpoint.id);
    console.log("🔑 Webhook signing secret:", webhookEndpoint.secret);

    // ⚠️ Store webhookEndpoint.secret in your secure env (.env)
  } catch (err) {
    console.error("❌ Error creating webhook:", err.message);
  }
}

setupWebhook();
