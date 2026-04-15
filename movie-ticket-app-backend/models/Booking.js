const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  showtime: { type: mongoose.Schema.Types.ObjectId, ref: "Showtime", required: true, index: true },
  seats: [{ type: String, required: true }],
  status: {
    type: String,
    enum: ["pending", "paid", "cancelled"],
    default: "pending",
    index: true,
  },
  expiresAt: { type: Date, default: null, index: true }, // Thời gian hết hạn nếu chưa thanh toán
  createdAt: { type: Date, default: null, }, // Thêm tay sau khi thanh toán thành công
}, {
  // Compound index for the expired booking cleaner query — most frequent
  toJSON: { virtuals: true },
});

// Index: find active bookings for a showtime (used in hold, reserved-seats, admin-edit)
bookingSchema.index({ showtime: 1, status: 1 });

// Index: find expired pending bookings (used by bookingCleaner every 60s)
bookingSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
