const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },    // Tên phòng chiếu
  capacity: { type: Number, required: true },               // Số ghế tối đa trong phòng
  location: { type: String },                               // Vị trí phòng (Tầng 1, Khu A...)
});

module.exports = mongoose.model("Room", roomSchema);
