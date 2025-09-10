import nodemailer from "nodemailer";
import { generateTicketPDF } from "./pdf.service.js";
import Order from "../models/order.model.js";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

export const sendTicketEmailAfterPayment = async (orderId) => {
    try {
        const order = await Order.findById(orderId).populate('userId', 'name email').populate('eventId', 'title startDate endDate').populate('tickets');

        if (!order) {
            throw new Error("Order not found");
        }

        if (!order.userId) {
            throw new Error("User not found");
        }

        const user = {
            email: order.userId.email,
            name: order.userId.name,
        };

        const event = {
            title: order.eventId.title,
            startDate: order.eventId.startDate,
            endDate: order.eventId.endDate,
        };

        await sendTicketsEmail(user.email, user.name, order, order.tickets, event);

        console.log('Ticket email sent successfully for order:', orderId);
    } catch (error) {
        console.error("Error in sendTicketEmailAfterPayment:", error);
        throw error;
    }
}

const sendTicketsEmail = async (userEmail, userName, order, tickets, event) => {
    try {

        const pdfAttachment = await Promise.all(
            tickets.map(async (ticket) => {
                try {
                const pdfBuffer = await generateTicketPDF(ticket, event, {name: userName});
                return {
                    filename: `Ticket-${ticket.ticketCode || ticket._id}.pdf`,
                    content: pdfBuffer,
                    contentType: "application/pdf"
                };
            } catch (pdfError) {
                console.error("Error generating PDF for ticket:", ticket._id, pdfError);
                return null;
            }
            })
        );

        const validAttachments = pdfAttachment.filter(attachment => attachment !== null);

        if (validAttachments.length === 0) {
            throw new Error("Failed to generate any ticket PDFs");
        }



        const plainTextContent = `Hi ${userName},\n\nThank you for your order (#${order._id})! Your tickets are attached.\n\nEvent: ${event.title}\nQuantity: ${tickets.length}\nTotal Paid: $${order.amount}\n\nSee you there!`;

        const htmlContent = `
      <div>
        <h2>Hi ${userName},</h2>
        <p>Thank you for your order <strong>#${order.id}</strong>! Your tickets are below.</p>
        <p><strong>Event:</strong> ${event.title}<br/>
           <strong>Quantity:</strong> ${tickets.length}<br/>
           <strong>Total Paid:</strong> ₹${order.amount}</p>
        <p>See you there!</p>
      </div>
    `;


        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: "lalitsutariya009@gmail.com",
            subject: `Your Tickets for Order #${order._id}`,
            text: plainTextContent,
            html: htmlContent,
            attachments: pdfAttachment
            // attachments: attachments // Attach the generated tickets
        };

        let info = await transporter.sendMail(mailOptions);
        console.log('Ticket email sent: ', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending ticket email:', error);
        throw new Error('Email could not be sent');
    }
}