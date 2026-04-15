/**
 * ShowtimeService — showtime business logic.
 */
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const logger = require('../utils/logger');

class ShowtimeService {
  /**
   * Generate seat layout for a room (A1..J15 by default).
   */
  generateSeats(rows = 10, cols = 15) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const seats = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 1; j <= cols; j++) {
        seats.push({ seatNumber: `${alphabet[i]}${j}`, isBooked: false });
      }
    }
    return seats;
  }

  /**
   * Create a new showtime (checks for room conflicts first).
   */
  async create(data) {
    const { movie, dateTime, room: roomId, ticketPrice, format, language, note, duration } = data;

    const room = await Room.findById(roomId);
    if (!room) {
      const err = new Error('Phòng chiếu không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    const newStart = new Date(dateTime);
    const newEnd = new Date(newStart.getTime() + (duration || 0) * 60000);

    // Overlap = existing starts before new ends AND existing ends after new starts
    const conflict = await Showtime.findOne({
      room: roomId,
      dateTime: { $lt: newEnd },
      $expr: { $gt: ['$endDateTime', newStart] },
    });

    if (conflict) {
      const err = new Error('Không thể tạo suất chiếu trùng thời gian trong cùng phòng');
      err.statusCode = 400;
      throw err;
    }

    const showtime = await Showtime.create({
      movie,
      dateTime,
      endDateTime: newEnd,
      room: roomId,
      seats: this.generateSeats(),
      ticketPrice,
      format,
      language,
      note,
    });

    logger.info('ShowtimeService', `Showtime created: ${showtime._id}`, { movie, room: roomId, dateTime });
    return showtime;
  }

  /**
   * Get all showtimes with populated movie + room.
   */
  async getAll() {
    return Showtime.find()
      .populate('movie', 'title poster duration')
      .populate('room', 'name capacity')
      .lean();
  }

  /**
   * Get available seats count for a showtime.
   */
  async getAvailableSeats(showtimeId) {
    const showtime = await Showtime.findById(showtimeId).lean();
    if (!showtime) return null;

    const { total } = showtime.seats.reduce(
      (acc, s) => ({ total: acc.total + 1, booked: acc.booked + (s.isBooked ? 1 : 0) }),
      { total: 0, booked: 0 }
    );

    const bookings = await Booking.find({
      showtime: showtimeId,
      status: { $ne: 'cancelled' },
    });
    const reservedCount = bookings.reduce((sum, b) => sum + b.seats.length, 0);

    return {
      total,
      booked: reservedCount,
      available: total - reservedCount,
    };
  }

  /**
   * Get showtimes for a specific movie.
   */
  async getByMovie(movieId) {
    return Showtime.find({ movie: movieId })
      .populate('room')
      .populate('movie')
      .lean();
  }

  /**
   * Get a single showtime by ID.
   */
  async getById(id) {
    return Showtime.findById(id).lean();
  }

  /**
   * Update a showtime by ID.
   */
  async update(id, data) {
    return Showtime.findByIdAndUpdate(id, data, { new: true });
  }

  /**
   * Delete a showtime by ID.
   */
  async delete(id) {
    return Showtime.findByIdAndDelete(id);
  }
}

module.exports = new ShowtimeService();