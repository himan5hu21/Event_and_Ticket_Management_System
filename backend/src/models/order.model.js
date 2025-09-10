import mongoose from "mongoose";

const Schema = mongoose.Schema;

const orderItemSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["general", "vip"],
      required: true,
      default: "general",
    },
    quantity: { type: Number, min: 1, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    payment: {
      provider: {
        type: String,
        enum: ["razorpay", "stripe"],
        default: "razorpay",
      },
      orderId: { type: String },
      paymentId: { type: String },
      signature: { type: String },
    },
    amount: { type: Number, required: true },
    items: [orderItemSchema],
    currency: {
      type: String,
      required: true,
      default: "INR",
      enum: ["INR", "USD", "EUR", "GBP"],
    },
    tickets: [{ type: Schema.Types.ObjectId, ref: "Ticket" }],
    status: {
      type: String,
      required: true,
      default: "pending",
      enum: [
        "pending",
        "success",
        "failed",
        "cancelled",
        "refunded",
        "partially_refunded",
      ],
    },
    paymentMethod: {
      type: String,
      enum: ["card", "netbanking", "upi", "wallet", "cash"],
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ userId: 1, eventId: 1 });
orderSchema.index({ "payment.orderId": 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ expiresAt: 1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;
