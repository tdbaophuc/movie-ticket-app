/**
 * BookingController — thin HTTP handlers calling BookingService + TicketService.
 */
const BookingService = require('../services/BookingService');
const TicketService = require('../services/TicketService');
const apiResponse = require('../utils/apiResponse');

// POST /api/bookings/hold
exports.holdSeats = async (req, res, next) => {
  try {
    const { showtimeId, seats } = req.body;
    const booking = await BookingService.holdSeats({ userId: req.user.id, showtimeId, seats });
    apiResponse(res).created({ booking }, 'Tạm giữ vé thành công. Vui lòng thanh toán trong 5 phút.');
  } catch (err) {
    next(err);
  }
};

// POST /api/bookings/pay/:bookingId
exports.confirmPayment = async (req, res, next) => {
  try {
    const booking = await BookingService.confirmPayment({ bookingId: req.params.bookingId, userId: req.user.id });
    apiResponse(res).success({ booking }, 'Thanh toán thành công. Vé đã được đặt.');
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/my
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await BookingService.getUserBookings({ userId: req.user.id });
    if (!bookings || bookings.length === 0) {
      return apiResponse(res).error('Không có vé nào', 404);
    }
    const enriched = await TicketService.enrichWithQrCode(bookings);
    apiResponse(res).success({ bookings: enriched });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/bookings/:bookingId
exports.cancelByCustomer = async (req, res, next) => {
  try {
    await BookingService.cancelByCustomer({ bookingId: req.params.bookingId, userId: req.user.id });
    apiResponse(res).success(null, 'Đã huỷ vé thành công');
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/reserved-seats/:showtimeId
exports.getReservedSeats = async (req, res, next) => {
  try {
    const reservedSeats = await BookingService.getReservedSeats({ showtimeId: req.params.showtimeId });
    apiResponse(res).success({ reservedSeats });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/admin/bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await BookingService.getAllBookings();
    apiResponse(res).success({ bookings });
  } catch (err) {
    next(err);
  }
};

// PUT /api/bookings/admin/bookings/:bookingId
exports.updateBooking = async (req, res, next) => {
  try {
    const booking = await BookingService.updateSeats({
      bookingId: req.params.bookingId,
      seats: req.body.seats,
    });
    apiResponse(res).success({ booking }, 'Thông tin vé đã được cập nhật');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/bookings/admin/bookings/:bookingId
exports.cancelByAdmin = async (req, res, next) => {
  try {
    await BookingService.cancelByAdmin({ bookingId: req.params.bookingId });
    apiResponse(res).success(null, 'Đã huỷ vé thành công');
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/successful/:bookingId — email ticket PDF
exports.sendTicketByEmail = async (req, res, next) => {
  try {
    await TicketService.emailTicket({ bookingId: req.params.bookingId, userId: req.user.id });
    apiResponse(res).success(null, 'Vé đã được gửi về email của bạn.');
  } catch (err) {
    next(err);
  }
};
