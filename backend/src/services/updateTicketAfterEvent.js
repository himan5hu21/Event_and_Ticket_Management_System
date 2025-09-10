import Event from "../models/event.model.js";
import Ticket from "../models/ticket.model.js";

const updateTicketAfterEvent = async () => {
  const completedEvents = await Event.find({ status: "completed" });
  const cancelledEvents = await Event.find({ status: "cancelled" });

  for (let event of completedEvents) {
    await Ticket.updateMany(
      { eventId: event._id, status: "booked" },
      { $set: { status: "expired" } }
    );

    await Ticket.updateMany(
      { eventId: event._id, status: "pending" },
      { $set: { status: "cancelled" } }
    );
  }

  for (let event of cancelledEvents) {
    await Ticket.updateMany(
      { eventId: event._id, status: "booked" },
      { $set: { status: "refunded" } }
    );

    await Ticket.updateMany(
      { eventId: event._id, status: "pending" },
      { $set: { status: "cancelled" } }
    );
  }
};

export default updateTicketAfterEvent;
