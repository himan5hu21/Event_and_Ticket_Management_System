// helper-signature.js
import crypto from "crypto";
import env from "../config/env.js";

// Example test order_id
const razorpayOrderId = "order_REiUK2sbJy4hBX";

// Generate a random test payment_id
function generateFakePaymentId() {
  return "pay_" + crypto.randomBytes(8).toString("hex"); // e.g. pay_a1b2c3d4e5f6g7h8
}

const razorpayPaymentId = generateFakePaymentId();

// Your test secret key (from Razorpay Dashboard → API Keys → Test Mode)
const secret = env.RAZORPAY_KEY_SECRET;

function generateSignature(orderId, paymentId, secret) {
  const body = orderId + "|" + paymentId;
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

const signature = generateSignature(razorpayOrderId, razorpayPaymentId, secret);

console.log("Generated Fake PaymentId:", razorpayPaymentId);
console.log("Generated Signature:", signature);
