import Order from "../models/order.model.js";
import Ticket from "../models/ticket.model.js";
import Event from "../models/event.model.js";
import cron from "node-cron";
import updateTicketAfterEvent from "./updateTicketAfterEvent.js";

const initCronJobs = () => {
  cron.schedule("*/30 * * * * *", async () => {
    const now = new Date();

    try {
      const expiredOrders = await Order.find({
        status: "pending",
        expiresAt: { $lte: now },
      }).populate("tickets");

      for (const order of expiredOrders) {
        try {
          order.status = "cancelled";
          await order.save();

          await Order.deleteOne({ _id: order._id });

          if (order.tickets && order.tickets.length > 0) {
            const ticketIds = order.tickets.map(
              (ticket) => ticket._id || ticket
            );

            await Ticket.updateMany(
              { _id: { $in: ticketIds } },
              {
                $set: {
                  status: "cancelled",
                },
              }
            );
          }
        } catch (err) {
          console.error("Error cancelling razorpay order:", err);
        }
      }

      await Event.updateMany(
        {
          startDate: { $gt: now },
          status: { $nin: ["pending", "cancelled"] },
        },
        { $set: { status: "pending" } }
      );

      await Event.updateMany(
        {
          startDate: { $lte: now },
          endDate: { $gte: now },
          status: { $nin: ["active", "cancelled"] },
        },
        { $set: { status: "active" } }
      );

      await Event.updateMany(
        {
          endDate: { $lt: now },
          status: { $nin: ["completed", "cancelled"] },
        },
        { $set: { status: "completed" } }
      );

      // Reset daily ticket status for active multi-day events
      const activeEvents = await Event.find({
        status: "active",
        startDate: { $lte: now },
        endDate: { $gte: now }
      });

      for (const event of activeEvents) {
        // For each day of the event, reset "used" status to "pending" at midnight
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        const today = new Date().toISOString().split('T')[0];
        
        // Only reset if we're in the middle of a multi-day event
        if (eventEnd > eventStart) {
          await Ticket.updateMany(
            { 
              eventId: event._id,
              status: "booked",
              "dailyCheckIns.date": today,
              "dailyCheckIns.status": "used"
            },
            {
              $set: {
                "dailyCheckIns.$.status": "pending"
              }
            }
          );
        }
      }

       // Expire tickets after event completion
      const completedEvents = await Event.find({ status: "completed" });
      const completedEventIds = completedEvents.map(event => event._id);

      await Ticket.updateMany(
        {
          eventId: { $in: completedEventIds },
          status: { $in: ["booked", "used"] }
        },
        {
          $set: {
            status: "expired",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expire 7 days after event
          }
        }
      );

      updateTicketAfterEvent();
    } catch (err) {
      console.error("Error in cron job:", err.message);
    }
  });

  // Additional cron job to run daily at midnight for ticket status reset
  cron.schedule("0 0 * * *", async () => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));

    try {
      // Find all active multi-day events
      const activeMultiDayEvents = await Event.find({
        status: "active",
        endDate: { $gt: today } // Events that continue beyond today
      });

      for (const event of activeMultiDayEvents) {
        const today = new Date().toISOString().split('T')[0];
        console.log(`Cleaning up expired events for ${today}`);
        await Ticket.updateMany(
          {
            eventId: event._id,
            status: "booked"
          },
          {
            $push: {
              dailyCheckIns: {
                date: today,
                checkInTime: null,
                status: "pending"
              }
            }
          }
        );
      }
    } catch (err) {
      console.error("Error in daily ticket reset cron job:", err.message);
    }
  });
};

export default initCronJobs;
