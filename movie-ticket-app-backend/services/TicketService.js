/**
 * TicketService — PDF generation, QR codes, and email delivery.
 * Extracted from bookingRoutes.js /successful endpoint.
 */
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const stream = require('stream');
const path = require('path');
const nodemailer = require('nodemailer');
const getStream = require('get-stream');
const fs = require('fs');
const Booking = require('../models/Booking');
const logger = require('../utils/logger');

const TicketService = {
  /**
   * Generate a QR code as a data URL for a booking.
   * @param {string} bookingId
   * @returns {Promise<string>} data URL
   */
  async generateQrCode(bookingId) {
    const qrContent = `Mã vé: ${bookingId}`;
    return QRCode.toDataURL(qrContent);
  },

  /**
   * Enrich a booking array with QR codes for paid bookings.
   * @param {Array} bookings
   * @returns {Promise<Array>}
   */
  async enrichWithQrCode(bookings) {
    return Promise.all(
      bookings.map(async (booking) => {
        if (booking.status !== 'paid') return booking;
        try {
          const qrCode = await this.generateQrCode(booking._id);
          return { ...booking, qrCode };
        } catch (err) {
          logger.error('TicketService', 'QR generation failed', {
            bookingId: booking._id,
            error: err.message,
          });
          return booking;
        }
      })
    );
  },

  /**
   * Generate a ticket PDF as a Buffer.
   * @param {Object} booking — populated Booking document
   * @returns {Promise<Buffer>}
   */
  async generateTicketPdf(booking) {
    const qrContent =
      `Mã vé: ${booking._id}\n` +
      `Tên phim: ${booking.showtime.movie.title}\n` +
      `Ghế: ${booking.seats.join(', ')}`;

    const qrDataURL = await QRCode.toDataURL(qrContent);
    const qrImage = qrDataURL.replace(/^data:image\/png;base64,/, '');
    const imgBuffer = Buffer.from(qrImage, 'base64');

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
    const fontPath = path.join(__dirname, '../fonts/Roboto-Regular.ttf');
    doc.registerFont('Roboto', fontPath);
    doc.font('Roboto');

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 40;
    const primaryColor = '#1e40af';
    const secondaryColor = '#fb923c';
    const borderColor = '#e5e7eb';
    const textColor = '#111827';

    const bufferStream = new stream.PassThrough();
    doc.pipe(bufferStream);

    // Logo + cinema name
    const logoPath = path.join(__dirname, '../assets/logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, margin + 10, margin + 10, { width: 80 });
    }
    doc.fillColor(primaryColor).fontSize(28).text('DNC CINEMAS', margin + 110, margin + 25);

    doc.fillColor(secondaryColor).fontSize(20).text(
      '🎟️ VÉ XEM PHIM',
      pageWidth - margin - 200,
      margin + 35,
      { align: 'right' }
    );

    // Content area
    const contentTop = margin + 80;
    const contentHeight = pageHeight - contentTop - margin;
    const qrBoxSize = 180;
    const contentWidth = pageWidth - margin * 2;
    const infoBoxWidth = contentWidth - qrBoxSize - 40;

    doc.roundedRect(margin, contentTop, contentWidth, contentHeight, 12).stroke(borderColor);
    doc
      .roundedRect(margin + 20, contentTop + 20, infoBoxWidth, contentHeight - 40, 8)
      .stroke(borderColor);

    doc
      .fontSize(14)
      .fillColor(textColor)
      .text(`Tên phim: ${booking.showtime.movie.title}`, margin + 40, contentTop + 40)
      .moveDown(0.5)
      .text(`Ngày chiếu: ${new Date(booking.showtime.dateTime).toLocaleString()}`)
      .moveDown(0.5)
      .text(`Phòng chiếu: ${booking.showtime.room.name}`)
      .moveDown(0.5)
      .text(`Ghế: ${booking.seats.join(', ')}`)
      .moveDown(0.5)
      .text(`Mã vé: ${booking._id}`)
      .moveDown(0.5)
      .text(`Khách hàng: ${booking.user.name}`);

    const qrX = pageWidth - margin - qrBoxSize;
    doc.roundedRect(qrX, contentTop + 40, qrBoxSize, qrBoxSize, 8).stroke(borderColor);
    doc.image(imgBuffer, qrX + 15, contentTop + 55, {
      fit: [qrBoxSize - 30, qrBoxSize - 30],
      align: 'center',
    });

    doc.end();
    return getStream.buffer(bufferStream);
  },

  /**
   * Email a ticket PDF to the booking owner.
   * @param {Object} params
   * @param {string} params.bookingId
   * @param {string} params.userId — must match booking owner
   */
  async emailTicket({ bookingId, userId }) {
    const booking = await Booking.findById(bookingId)
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title' },
          { path: 'room', select: 'name' },
        ],
      })
      .populate({ path: 'user', select: 'name email' });

    if (!booking || booking.user._id.toString() !== userId) {
      const err = new Error('Không có quyền truy cập vé này');
      err.statusCode = 403;
      throw err;
    }

    if (booking.status !== 'paid') {
      const err = new Error('Chỉ có thể gửi vé đã thanh toán');
      err.statusCode = 400;
      throw err;
    }

    const pdfBuffer = await this.generateTicketPdf(booking);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"DNC Cinemas" <${process.env.EMAIL_USER}>`,
      to: booking.user.email,
      subject: `Vé xem phim DNC Cinemas - Mã vé: ${booking._id}`,
      text:
        `Xin chào ${booking.user.name},\n\n` +
        `Cảm ơn bạn đã đặt vé tại DNC Cinemas. ` +
        `Vé xem phim của bạn được đính kèm trong email này.\n\n` +
        `Chúc bạn xem phim vui vẻ!\n\nTrân trọng,\nDNC Cinemas`,
      attachments: [{ filename: `ve_${booking._id}.pdf`, content: pdfBuffer }],
    });

    logger.info('TicketService', `Ticket emailed to ${booking.user.email}`, { bookingId });
  },
};

module.exports = TicketService;
