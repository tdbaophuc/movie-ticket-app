const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  showtime: { type: mongoose.Schema.Types.ObjectId, ref: "Showtime", required: true },
  seats: [{ type: String, required: true }],
  status: {
    type: String,
    enum: ["pending", "paid", "cancelled"],
    default: "pending",
  },
  expiresAt: { type: Date, default: null, }, // Thời gian hết hạn nếu chưa thanh toán
  createdAt: { type: Date, default: null, }, // Thêm tay sau khi thanh toán thành công
});

module.exports = mongoose.model("Booking", bookingSchema);
