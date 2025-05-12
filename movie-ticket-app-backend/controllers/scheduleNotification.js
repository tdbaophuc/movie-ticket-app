const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const Movie = require("../models/Movie");
const Room = require("../models/Room");
const mongoose = require("mongoose");

const sendReminderNotifications = async () => {
  try {
    const now = new Date();
    const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000);

    // Lấy các vé đã thanh toán, có suất chiếu trong 30 phút tới
    const bookings = await Booking.find({
      status: "paid"
    })
      .populate({
        path: "showtime",
        match: {
          dateTime: { $gte: now, $lte: thirtyMinutesLater }
        },
        populate: [
          { path: "movie", select: "title" },
          { path: "room", select: "name" }
        ]
      })
      .exec();

    // Lọc các booking có showtime hợp lệ
const validBookings = bookings.filter(
  (b) => b.showtime && b.showtime.movie && b.showtime.room
);

for (const booking of validBookings) {
  // Kiểm tra đã từng gửi thông báo chưa (tránh gửi lặp lại)
  const existing = await Notification.findOne({
    userId: booking.user,
    type: "info",
    referenceId: booking._id
  });

  if (existing) continue;

  await Notification.create({
    userId: booking.user,
    title: `Sắp đến giờ chiếu phim "${booking.showtime.movie.title}"`,
    message: `Suất chiếu tại ${booking.showtime.room.name} sẽ bắt đầu lúc ${new Date(booking.showtime.dateTime).toLocaleTimeString()}.`,
    icon: "ticket-outline",
    type: "info",
    referenceId: booking._id,
  });
}

    console.log("Đã kiểm tra và gửi thông báo nhắc nhở.");
  } catch (err) {
    console.error("Lỗi gửi thông báo nhắc giờ chiếu:", err);
  }
};

module.exports = sendReminderNotifications;
