import { nanoid } from "nanoid";
import razorpay from "../config/razorpay.js";
import Event from "../models/event.model.js";
import Order from "../models/order.model.js";
import Ticket from "../models/ticket.model.js";
import mongoose from "mongoose";
import verifyPaymentSignature from "../services/verifyPaymentSignature.js";
import User from "../models/user.model.js";
import { sendTicketEmailAfterPayment } from "../services/email.service.js";

export const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items } = req.body;
    const userId = req.user._id;
    const { eventId } = req.params;

    const event = await Event.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      session.endSession();
      return res.notFound("Event not found");
    }

    let amount = 0;

    for (const item of items) {
      const ticketType = event.tickets.find((t) => t.type === item.type);
      if (!ticketType) {
        await session.abortTransaction();
        session.endSession();
        throw new Error(`Ticket type ${item.type} not found`);
      }

      if (ticketType.quantity < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        throw new Error(`Not enough tickets of type ${item.type} available`);
      }
      amount += item.quantity * ticketType.price;
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    const order = await Order.create(
      [
        {
          eventId,
          userId,
          amount,
          currency: "INR",
          items: items,
          payment: {
            provider: "razorpay",
            orderId: razorpayOrder.id,
          },
          status: "pending",
        },
      ],
      { session }
    );

    const createdOrder = order[0];

    const tickets = [];
    for (const item of items) {
      for (let i = 0; i < item.quantity; i++) {
        tickets.push({
          orderId: createdOrder._id,
          userId,
          eventId,
          ticketCode: nanoid(12),
          ticketType: item.type,
          price: await event.tickets.find((t) => t.type === item.type).price,
          status: "pending",
        });
      }
    }

    const createdTickets = await Ticket.insertMany(tickets, { session });

    if (createdTickets.length === 0) {
      throw new Error("Failed to create tickets");
    }

    createdOrder.tickets = createdTickets.map((ticket) => ticket._id);
    const updatedOrder = await createdOrder.save({ session });

    if (!updatedOrder) {
      throw new Error("Order was not updated");
    }

    await session.commitTransaction();
    session.endSession();

    res.created(
      { order: updatedOrder, razorpayOrder },
      "Order created successfully"
    );
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

export const verifyPayment = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      await session.abortTransaction();
      return res.badRequest("Missing payment details");
    }

    try {
      const isValid = verifyPaymentSignature({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      if (!isValid) {
        await session.abortTransaction();
        session.endSession();
        return res.badRequest(
          "Payment verification failed - Invalid signature"
        );
      }
    } catch (verifyError) {
      await session.abortTransaction();
      session.endSession();
      return res.badRequest("Signature verification failed");
    }

    const order = await Order.findOne({
      "payment.orderId": razorpay_order_id,
    }).session(session);
    if (!order) return res.notFound("Order not found");

    if (order.status === "success") {
      await session.commitTransaction();
      session.endSession();
      return res.success({ order }, "Payment already verified earlier");
    }

    order.status = "success";
    order.payment.paymentId = razorpay_payment_id;
    order.payment.signature = razorpay_signature;
    const updatedOrder = await order.save({ session });

    if (!updatedOrder) {
      throw new Error("Order was not updated");
    }

    const ticketIds = order.tickets.map((ticket) => ticket.toString());

    const tickets = await Ticket.updateMany(
      { _id: { $in: ticketIds }, status: { $ne: "booked" } },
      { $set: { status: "booked", expiresAt: null } },
      { session }
    );

    console.log("Tickets:", order.tickets);
    console.log(
      "Types of elements:",
      order.tickets.map((t) => typeof t)
    );

    console.log("Update result:", {
      matchedCount: tickets.matchedCount,
      modifiedCount: tickets.modifiedCount,
      acknowledged: tickets.acknowledged,
    });

    if (tickets.matchedCount + tickets.modifiedCount < ticketIds.length) {
      throw new Error("Some tickets could not be booked");
    }

    for (const item of order.items) {
      const eventUpdate = await Event.updateOne(
        { _id: order.eventId },
        {
          $inc: {
            "tickets.$[ticket].sold": item.quantity,
          },
        },
        {
          arrayFilters: [{ "ticket.type": item.type }],
          session,
        }
      );

      console.log(eventUpdate);

      if (eventUpdate.modifiedCount === 0) {
        console.log("Trying alternative update method...");

        const event = await Event.findById(order.eventId).session(session);
        if (!event) {
          throw new Error("Event not found");
        }

        const ticketIndex = event.tickets.findIndex(
          (t) => t.type === item.type
        );
        if (ticketIndex === -1) {
          throw new Error(`Ticket type ${item.type} not found in event`);
        }

        event.tickets[ticketIndex].sold += item.quantity;

        await event.save({ session });
        console.log("Event updated using alternative method");
      }
    }

    await session.commitTransaction();

    res.success(
      { order: updatedOrder, tickets },
      "Payment verified successfully"
    );

    // Now send email asynchronously (don't wait for it)
    try {
      await sendTicketEmailAfterPayment(updatedOrder._id);
    } catch (emailError) {
      console.error('Error sending ticket email:', emailError);
      // Don't throw error here as payment is already successful
    }

  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

export const getOrderDetails = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate({
        path: "eventId",
        select: "title startDate endDate createdBy",
        populate: {
          path: "createdBy",
          select: "name organization",
        },
      })
      .populate("tickets")
      .populate("userId", "name email phone");

    if (!order) {
      return res.notFound("Order not found");
    }

    res.success(order, "Order fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const {
      status,
      user,
      event,
      page = 1,
      limit = 10,
      sortBy,
      order,
      search,
      startDate,
      endDate,
      ...filters
    } = req.query;

    const role = req.user.role;
    const userId = req.user._id;

    const queryFilter = {};

    if (status) {
      queryFilter.status = Array.isArray(status) ? { $in: status } : status;
    }

    if (role === "admin") {
      if (user) queryFilter.userId = user;
      if (event) queryFilter.event = event;
    } else if (role === "event-manager") {
      const myEvents = await Event.find({ createdBy: userId }).select("_id");
      const myEventsId = myEvents.map((e) => e._id);

      queryFilter.eventId = { $in: myEventsId };
    } else {
      queryFilter.userId = userId;
    }

    if (search) {
      const users = await User.find({
        $or: [
          { name: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
          { phone: new RegExp(search, "i") },
        ],
      }).select("_id");

      const events = await Event.find({
        title: new RegExp(search, "i"),
      }).select("_id");

      queryFilter.$or = [
        {
          userId: { $in: users.map((u) => u._id) },
        },
        { eventId: { $in: events.map((e) => e._id) } },
        { "payment.orderId": new RegExp(search, "i") },
      ];
    }

    if (startDate || endDate) {
      queryFilter.createdAt = {};

      if (startDate) {
        const parsedStart = new Date(startDate);
        if (!isNaN(parsedStart)) {
          queryFilter.createdAt.$gte = parsedStart;
        }
      }

      if (endDate) {
        const parsedEnd = new Date(endDate);
        if (!isNaN(parsedEnd)) {
          parsedEnd.setHours(23, 59, 59, 999);
          queryFilter.createdAt.$lte = parsedEnd;
        }
      }

      // If no valid dates were set, remove the empty createdAt object
      if (Object.keys(queryFilter.createdAt).length === 0) {
        delete queryFilter.createdAt;
      }
    }

    const pageNum = Math.max(parseInt(page), 1);
    const pageLimit = Math.min(parseInt(limit), 100);
    const skip = (pageNum - 1) * pageLimit;

    let sortOptions = {};
    const sortOrder = order === "asc" ? 1 : -1;
    switch (sortBy) {
      case "amount":
        sortOptions = { amount: sortOrder, createdAt: -1 };
        break;
      case "createdAt":
        sortOptions = { createdAt: sortOrder };
        break;
      case "status":
        sortOptions = { status: sortOrder, createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    Object.assign(queryFilter, filters);

    let query = Order.find(queryFilter)
      .populate("eventId", "title startDate endDate")
      .populate("userId", "name email phone")
      .sort(sortOptions)
      .skip(skip)
      .limit(pageLimit);

    const orders = await query;
    const totalOrders = await Order.countDocuments(queryFilter);

    if (!orders.length) {
      return res.notFound("No orders found");
    }

    const updatedOrders = orders.map((order) => ({
      ...order.toObject(),
      ticketLength: order.tickets?.length || 0,
    }));

    res.success({
      orders: updatedOrders,
      pagination: {
        total: totalOrders,
        page: pageNum,
        limit: pageLimit,
        totalPages: Math.ceil(totalOrders / pageLimit),
      },
      filters: { status, user, event, search, ...filters },
    });
  } catch (err) {
    next(err);
  }
};
