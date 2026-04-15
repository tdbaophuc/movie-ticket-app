/**
 * BookingService — Phase 1: full business logic extracted from bookingRoutes.js.
 * Phase 0 stub: only cleanExpiredBookings() is needed by server.js.
 */
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// ──────────────────────────────────────────────────────────────────────────────
// Phase 0 stub — keep until Phase 1 extraction is complete
// ──────────────────────────────────────────────────────────────────────────────

/** Called by server.js setInterval every 60s to expire stale pending bookings. */
async function cleanExpiredBookings() {
  const result = await Booking.updateMany(
    { status: 'pending', expiresAt: { $lt: new Date() } },
    { status: 'cancelled' }
  );
  return result.modifiedCount;
}

// ──────────────────────────────────────────────────────────────────────────────
// Phase 1 — full business logic (progressively fill in)
// ──────────────────────────────────────────────────────────────────────────────

const BookingService = {
  // ── Stub ──────────────────────────────────────────────────────────────────
  cleanExpiredBookings,

  // ── Hold seats (Phase 1) ───────────────────────────────────────────────────
  /**
   * Hold seats for a showtime (5-minute pending expiry).
   */
  async holdSeats({ userId, showtimeId, seats }) {
    if (!showtimeId || !seats || !Array.isArray(seats) || seats.length === 0) {
      const err = new Error('Thiếu thông tin suất chiếu hoặc ghế');
      err.statusCode = 400;
      throw err;
    }

    const conflict = await Booking.findOne({
      showtime: showtimeId,
      status: { $ne: 'cancelled' },
      seats: { $in: seats },
    });

    if (conflict) {
      const err = new Error('Một hoặc nhiều ghế đã được giữ/đặt');
      err.statusCode = 400;
      throw err;
    }

    const booking = await Booking.create({
      user: userId,
      showtime: showtimeId,
      seats,
      status: 'pending',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    logger.info('BookingService', `Seats held: ${seats.join(', ')} for showtime ${showtimeId}`);
    return booking;
  },

  // ── Confirm payment (Phase 1) ───────────────────────────────────────────────
  /**
   * Confirm payment for a held booking.
   * Uses MongoDB transaction to atomically update booking + showtime seats.
   */
  async confirmPayment({ bookingId, userId }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const booking = await Booking.findOne({ _id: bookingId, user: userId })
        .populate('showtime')
        .session(session);

      if (!booking) {
        const err = new Error('Không tìm thấy vé hoặc không thuộc về bạn');
        err.statusCode = 403;
        throw err;
      }

      if (booking.status !== 'pending') {
        const err = new Error('Vé không ở trạng thái chờ thanh toán');
        err.statusCode = 400;
        throw err;
      }

      if (new Date() > booking.expiresAt) {
        booking.status = 'cancelled';
        await booking.save({ session });
        await session.commitTransaction();
        session.endSession();
        const err = new Error('Vé đã hết hạn, vui lòng đặt lại');
        err.statusCode = 400;
        throw err;
      }

      const showtime = await Showtime.findById(booking.showtime._id).session(session);
      booking.seats.forEach((seat) => {
        const idx = showtime.seats.findIndex((s) => s.seatNumber === seat);
        if (idx !== -1) showtime.seats[idx].isBooked = true;
      });
      await showtime.save({ session });

      booking.status = 'paid';
      booking.createdAt = new Date();
      await booking.save({ session });

      await session.commitTransaction();
      session.endSession();

      // Fire-and-forget notification
      Notification.create({
        userId,
        title: 'Đặt vé thành công',
        message: `Bạn đã đặt vé thành công cho suất chiếu lúc ${new Date(booking.showtime.dateTime).toLocaleString()}`,
        icon: 'ticket-outline',
        type: 'success',
      }).catch((e) => logger.error('BookingService', 'Notification failed', { error: e.message }));

      return booking;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  },

  // ── Cancel by customer (Phase 1) ───────────────────────────────────────────
  /**
   * Customer cancels their own booking.
   * Blocked if within 1 hour of showtime, or if already cancelled.
   */
  async cancelByCustomer({ bookingId, userId }) {
    const booking = await Booking.findOne({ _id: bookingId, user: userId }).populate('showtime');

    if (!booking) {
      const err = new Error('Bạn không có quyền huỷ vé này');
      err.statusCode = 403;
      throw err;
    }

    const showtimeTime = new Date(booking.showtime.dateTime);
    const oneHourBefore = new Date(showtimeTime.getTime() - 60 * 60 * 1000);
    if (new Date() >= oneHourBefore) {
      const err = new Error('Đã quá thời gian huỷ vé (chỉ huỷ trước giờ chiếu 1 tiếng)');
      err.statusCode = 400;
      throw err;
    }

    if (booking.status === 'paid') {
      await _releaseSeats(booking.showtime._id, booking.seats);
    }

    await Booking.findByIdAndDelete(bookingId);

    Notification.create({
      userId,
      title: 'Huỷ vé thành công',
      message: `Bạn đã huỷ vé thành công cho suất chiếu lúc ${new Date(booking.showtime.dateTime).toLocaleString()}`,
      icon: 'ticket-outline',
      type: 'success',
    }).catch((e) => logger.error('BookingService', 'Notification failed', { error: e.message }));
  },

  // ── Cancel by admin (Phase 1) ──────────────────────────────────────────────
  /**
   * Admin cancels any booking (no time restriction).
   */
  async cancelByAdmin({ bookingId }) {
    const booking = await Booking.findById(bookingId).populate('showtime');

    if (!booking) {
      const err = new Error('Không tìm thấy vé');
      err.statusCode = 404;
      throw err;
    }

    if (booking.status === 'paid') {
      await _releaseSeats(booking.showtime._id, booking.seats);
    }

    booking.status = 'cancelled';
    await booking.save();

    Notification.create({
      userId: booking.user,
      title: 'Vé đã bị huỷ',
      message: 'Vé đã bị huỷ bởi quản trị viên.',
      icon: 'ticket-outline',
      type: 'warning',
    }).catch((e) => logger.error('BookingService', 'Notification failed', { error: e.message }));
  },

  // ── Admin update booking seats (Phase 1) ───────────────────────────────────
  async updateSeats({ bookingId, seats }) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      const err = new Error('Không tìm thấy vé');
      err.statusCode = 404;
      throw err;
    }

    if (seats) {
      const conflict = await Booking.findOne({
        showtime: booking.showtime,
        _id: { $ne: bookingId },
        status: { $ne: 'cancelled' },
        seats: { $in: seats },
      });
      if (conflict) {
        const err = new Error('Một hoặc nhiều ghế đã có người giữ/đặt');
        err.statusCode = 400;
        throw err;
      }
      booking.seats = seats;
    }

    await booking.save();
    return booking;
  },

  // ── Get user's bookings (Phase 1) ──────────────────────────────────────────
  async getUserBookings({ userId }) {
    return Booking.find({ user: userId })
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title poster' },
          { path: 'room', select: 'name' },
        ],
      })
      .select('seats showtime status createdAt')
      .lean();
  },

  // ── Get all bookings (admin) (Phase 1) ──────────────────────────────────────
  async getAllBookings() {
    return Booking.find()
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title poster' },
          { path: 'room', select: 'name' },
        ],
      })
      .populate('user', 'name email')
      .lean();
  },

  // ── Reserved seats (public) (Phase 1) ──────────────────────────────────────
  async getReservedSeats({ showtimeId }) {
    const bookings = await Booking.find({ showtime: showtimeId, status: { $ne: 'cancelled' } });
    return bookings.flatMap((b) => b.seats);
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────────────────────────────────────

/** Release seats back to the showtime (set isBooked = false). */
async function _releaseSeats(showtimeId, seatNumbers) {
  const showtime = await Showtime.findById(showtimeId);
  if (!showtime) return;
  seatNumbers.forEach((seatNumber) => {
    const idx = showtime.seats.findIndex((s) => s.seatNumber === seatNumber);
    if (idx !== -1) showtime.seats[idx].isBooked = false;
  });
  await showtime.save();
}

module.exports = BookingService;
