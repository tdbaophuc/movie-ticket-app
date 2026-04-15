/**
 * NotificationService — CRUD + scheduled reminder notifications.
 */
const Notification = require('../models/Notification');
const Booking = require('../models/Booking');
const logger = require('../utils/logger');

const NotificationService = {
  /**
   * Get all notifications for a user, newest first.
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async getAll(userId) {
    return Notification.find({ userId }).sort({ createdAt: -1 }).lean();
  },

  /**
   * Get count of unread notifications for a user.
   * @param {string} userId
   * @returns {Promise<number>}
   */
  async getUnreadCount(userId) {
    return Notification.countDocuments({ userId, isRead: false });
  },

  /**
   * Create a notification for a user.
   * @param {string} userId
   * @param {Object} data — { title, message, icon?, type?, referenceId? }
   * @returns {Promise<Object>}
   */
  async create(userId, data) {
    return Notification.create({ userId, ...data });
  },

  /**
   * Mark a single notification as read.
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Object|null>}
   */
  async markAsRead(id, userId) {
    return Notification.findOneAndUpdate({ _id: id, userId }, { isRead: true }, { new: true });
  },

  /**
   * Mark all notifications as read for a user.
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async markAllAsRead(userId) {
    return Notification.updateMany({ userId, isRead: false }, { isRead: true });
  },

  /**
   * Send reminder notifications for paid bookings with showtimes in the next 30 minutes.
   * Called by server.js cron every minute.
   * Deduplicates by referenceId to avoid double-sending.
   */
  async sendShowtimeReminders() {
    const now = new Date();
    const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000);

    const bookings = await Booking.find({ status: 'paid' })
      .populate({
        path: 'showtime',
        match: { dateTime: { $gte: now, $lte: thirtyMinutesLater } },
        populate: [
          { path: 'movie', select: 'title' },
          { path: 'room', select: 'name' },
        ],
      })
      .lean();

    let sentCount = 0;

    for (const booking of bookings) {
      if (!booking.showtime || !booking.showtime.movie || !booking.showtime.room) continue;

      const existing = await Notification.findOne({
        userId: booking.user,
        type: 'info',
        referenceId: booking._id,
      });
      if (existing) continue;

      await Notification.create({
        userId: booking.user,
        title: `Sắp đến giờ chiếu phim "${booking.showtime.movie.title}"`,
        message: `Suất chiếu tại ${booking.showtime.room.name} sẽ bắt đầu lúc ${new Date(booking.showtime.dateTime).toLocaleTimeString()}.`,
        icon: 'ticket-outline',
        type: 'info',
        referenceId: booking._id,
      });
      sentCount++;
    }

    logger.info('NotificationService', `Checked ${bookings.length} paid bookings, sent ${sentCount} reminders`);
  },
};

module.exports = NotificationService;
