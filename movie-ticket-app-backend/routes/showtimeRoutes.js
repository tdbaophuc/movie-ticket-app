const express = require("express");
const router = express.Router();
const Showtime = require("../models/Showtime");
const Room = require("../models/Room");  // Import model Room
const { authMiddleware, authorizeRoles } = require("../middleware/auth");

// Hàm sinh ghế tại thời điểm tạo suất chiếu
function generateSeats(rows = 10, cols = 15) {
  const seats = [];
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let i = 0; i < rows; i++) {
    for (let j = 1; j <= cols; j++) {
      seats.push({ seatNumber: `${alphabet[i]}${j}`, isBooked: false });
    }
  }

  return seats;
}

// Thêm suất chiếu
router.post("/", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const { movie, dateTime, room, ticketPrice, format, language, note, duration } = req.body;

    // Kiểm tra phòng chiếu có tồn tại không
    const existingRoom = await Room.findById(room);
    if (!existingRoom) {
      return res.status(404).json({ message: "Phòng chiếu không tồn tại" });
    }

    // Tính thời gian bắt đầu và kết thúc của suất chiếu mới
    const newStart = new Date(dateTime);
    const newEnd = new Date(newStart.getTime() + duration * 60000);
    console.log("newStart", newStart);
    console.log("newEnd", newEnd);

    // Kiểm tra suất chiếu đã tồn tại trong cùng phòng và trùng thời gian
    const existingShowtimes = await Showtime.find({
      room: room,
      $or: [
        { dateTime: { $lt: newEnd }, endDateTime: { $gt: newStart } }, // So sánh với suất chiếu đã tồn tại
      ]
    });

    if (existingShowtimes.length > 0) {
      return res.status(400).json({ message: "Không thể tạo suất chiếu trùng thời gian trong cùng phòng" });
    }

    // Tạo danh sách ghế khi tạo suất chiếu
    const seats = generateSeats();  // Sinh danh sách ghế tại đây

    // Tạo suất chiếu mới
    const newShowtime = new Showtime({
      movie,
      dateTime,
      room,
      seats,
      ticketPrice,
      format,
      language,
      note,
      endDateTime: newEnd, // Lưu thời gian kết thúc để so sánh
    });

    await newShowtime.save();
    res.status(201).json({ message: "Tạo suất chiếu thành công", showtime: newShowtime });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo suất chiếu", error: err.message });
  }
});

// Sửa suất chiếu
router.put("/:id", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const updated = await Showtime.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật suất chiếu", error: err.message });
  }
});

// Xoá suất chiếu
router.delete("/:id", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    await Showtime.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xoá suất chiếu" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xoá suất chiếu", error: err.message });
  }
});


// Lấy danh sách suất chiếu
router.get("/", async (req, res) => {
  try {
    const showtimes = await Showtime.find().populate("movie").populate("room");
    res.json(showtimes);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách", error: err.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id);
    if (!showtime) return res.status(404).json({ message: 'Suất chiếu không tồn tại' });

    res.json(showtime);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.get('/movie/:movieId', async (req, res) => 

{
    try {
      const movieId = req.params.movieId;
      const showtimes = await Showtime.find({ movie: movieId })
        .populate('room') // để hiện thông tin phòng chiếu
        .populate('movie'); // để hiện thông tin phim (tuỳ chọn)
      res.json(showtimes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  


module.exports = router;