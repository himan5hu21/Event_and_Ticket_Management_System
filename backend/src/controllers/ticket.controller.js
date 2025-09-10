import Ticket from "../models/ticket.model.js";

export const getTicketByUserId = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;

        const tickets = await Ticket.find({orderId: orderId});

        if (!tickets) {
            return res.notFound("Ticket not found");
        }

        return res.success(tickets, "Ticket fetched successfully");
    } catch (err) {
        next(err);
    }
}