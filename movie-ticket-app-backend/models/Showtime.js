const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
  seatNumber: String,
  isBooked: { type: Boolean, default: false },
});

const showtimeSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  dateTime: { type: Date, required: true, index: true },       // Thời gian bắt đầu chiếu
  endDateTime: { type: Date },                                 // Thời gian kết thúc (movie.duration)
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
  seats: [seatSchema],
  ticketPrice: { type: Number, required: true },
  format: { type: String, enum: ["2D", "3D", "IMAX"], required: true },
  language: { type: String, enum: ["Phụ đề", "Lồng tiếng"], required: true },
  note: { type: String },
}, {
  toJSON: { virtuals: true },
});

// Compound index for calendar range queries (find showtimes by room in a time window)
showtimeSchema.index({ room: 1, dateTime: 1 });

module.exports = mongoose.model("Showtime", showtimeSchema);
