const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },         // Tên phim
  genre: { type: String, required: true },         // Thể loại
  description: { type: String, required: true },   // Mô tả
  duration: { type: Number, required: true },      // Thời lượng (phút)
  showtimes: [{ type: Date }] ,                     // Lịch chiếu
  poster: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Movie", movieSchema);
