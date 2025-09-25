import mongoose from "mongoose";

const { Schema } = mongoose;

const ticketSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ["general", "vip"],
    default: "general",
  },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  sold: { type: Number, default: 0 },
});

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
    },
    imageUrl: { type: String, required: true },
    imageId: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tickets: [ticketSchema],

    startDate: {
      type: Date,
      required: [true, "Event start date is required"],
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (v) {
          if (v) {
            return v >= this.startDate;
          }
          return true;
        },
        message: "End date must be greater than or equal to start date",
      },
      required: [true, "Event end date is required"],
    },
    category: {
      type: String,
      required: [true, "Event category is required"],
      trim: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    verified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },
    tags: [{ type: String, trim: true }],
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;
