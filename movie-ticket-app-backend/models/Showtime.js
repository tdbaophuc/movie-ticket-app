const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
  seatNumber: String,         // Ví dụ: A1, A2...
  isBooked: { type: Boolean, default: false },  // Trạng thái ghế (đã đặt hay chưa)
});

const showtimeSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },  // Tham chiếu tới bộ phim
  dateTime: { type: Date, required: true },        // Thời gian chiếu
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },  // Tham chiếu tới phòng chiếu
  seats: [seatSchema],  // Danh sách ghế
  ticketPrice: { type: Number, required: true },        //  Giá vé
  format: { type: String, enum: ["2D", "3D", "IMAX"], required: true }, //  Định dạng
  language: { type: String, enum: ["Phụ đề", "Lồng tiếng"], required: true }, //  Ngôn ngữ
  note: { type: String },
});

module.exports = mongoose.model("Showtime", showtimeSchema);