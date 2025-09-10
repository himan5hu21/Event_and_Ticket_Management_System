import QRCode from "qrcode";
import puppeteer from "puppeteer";

export const generateTicketPDF = async (ticket, event, user) => {
  const qrCodeData = ticket.ticketCode || ticket._id.toString();
  const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData);

  const ticketTypeName = ticket.ticketType || 'General';
  // const ticketPrice = ticket.price || '0';

  const eventDate = event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBA';
  const eventDates = event.startDate && event.endDate 
    ? `${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}`
    : eventDate;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          display: flex;
          justify-content: center;
        }
        .ticket-container {
          width: 100%;
          max-width: 400px;
          border: 2px solid #ddd;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          margin: 0 auto;
        }
        .ticket-header {
          background-color: #${event.primary_color || '4f46e5'};
          color: white;
          padding: 20px;
          text-align: center;
        }
        .ticket-body {
          padding: 20px;
        }
        .ticket-info {
          margin-bottom: 15px;
          line-height: 1.4;
        }
        .ticket-info strong {
          display: inline-block;
          width: 100px;
        }
        .qr-code {
          text-align: center;
          margin: 20px 0;
        }
        .ticket-footer {
          font-size: 12px;
          text-align: center;
          padding: 15px;
          background-color: #f9fafb;
          border-top: 1px solid #eee;
          line-height: 1.4;
        }
        @media print {
          body {
            margin: 0;
            padding: 20px;
          }
          .ticket-container {
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            border: 1px solid #ccc;
          }
        }
      </style>
    </head>
    <body>
      <div class="ticket-container">
        <div class="ticket-header">
          <h1 style="margin: 0 0 10px 0; font-size: 24px;">${event.title}</h1>
          <p style="margin: 0; font-size: 16px;">Admit One</p>
        </div>
        
        <div class="ticket-body">
          <div class="ticket-info"><strong>Event:</strong> ${event.title}</div>
          <div class="ticket-info"><strong>Date:</strong> ${eventDates}</div>
          <div class="ticket-info"><strong>Venue:</strong> ${event.venue_name || 'TBA'}</div>
          <div class="ticket-info"><strong>Ticket:</strong> ${ticketTypeName}</div>
          <div class="ticket-info"><strong>Attendee:</strong> ${user.name}</div>
          
          <div class="qr-code">
            <img src="${qrCodeDataUrl}" alt="QR Code for Ticket ${ticket.ticketCode || ticket._id}" width="150" height="150"/>
          </div>
          
          <div class="ticket-info"><strong>Ticket Code:</strong> ${ticket.ticketCode || ticket._id}</div>
          <div class="ticket-info"><strong>Order Ref:</strong> ${ticket.orderId}</div>
        </div>
        
        <div class="ticket-footer">
          Present this ticket at the entrance. &copy; ${new Date().getFullYear()} Your Company Name
        </div>
      </div>
    </body>
    </html>
  `;

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    await page.setContent(htmlContent, {waitUntil: "networkidle0"});

    // Get the height of the content
    const height = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      return Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      );
    });

    const pdfBuffer = await page.pdf({
      printBackground: true,
      width: '400px',
      height: `${height + 10}px`,
      pageRanges: '1',
      margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      }
    });

    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}