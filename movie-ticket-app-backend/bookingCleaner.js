const mongoose = require("mongoose");
const Booking = require("./models/Booking");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Kết nối MongoDB thành công (Booking Cleaner)");
    startCleaner();
  })
  .catch(err => {
    console.error(" Lỗi kết nối MongoDB:", err);
  });

function startCleaner() {
  setInterval(async () => {
    const now = new Date();

    // Tìm và huỷ các vé hết hạn chưa thanh toán
    const expired = await Booking.updateMany(
      { status: "pending", expiresAt: { $lt: now } },
      { status: "cancelled" }
    );

    if (expired.modifiedCount > 0) {
      console.log(`Đã huỷ ${expired.modifiedCount} vé hết hạn`);
    }
  }, 60 * 1000); // Mỗi 60 giây
}
