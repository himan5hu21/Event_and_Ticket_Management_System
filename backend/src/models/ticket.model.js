import mongoose from "mongoose";

const Schema = mongoose.Schema;

const dailyCheckInSchema = new Schema({
  date: { type: Date, required: true },
  checkInTime: { type: Date, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ["used", "pending"],
    default: "used"
  }
}, { _id: false });

const ticketSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    ticketCode: { type: String, required: true },
    status: {
      type: String,
      required: true,
      default: "pending",
      enum: ["pending", "booked", "used", "cancelled", "refunded", "expired"],
    },
    ticketType: {
      type: String,
      required: true,
      enum: ["general", "vip"],
      default: "general",
    },
    price: {
      type: Number,
      required: true,
    },
    seatNumber: {
      type: String,
    },
    dailyCheckIns: [dailyCheckInSchema],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.index({ userId: 1 });
ticketSchema.index({ orderId: 1 });
ticketSchema.index({ ticketCode: 1 }, { unique: true });
ticketSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
ticketSchema.index({ "dailyCheckIns.date": 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
