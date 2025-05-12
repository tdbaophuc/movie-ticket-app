const Movie = require("../models/Movie");
const Booking = require("../models/Booking");
const User = require("../models/User")
const Notification = require('../models/Notification');

// Thêm phim mới
const createMovie = async (req, res) => {
  try {

    const newMovie = new Movie(req.body);
    await newMovie.save();
    res.status(201).json(newMovie);
    const users = await User.find({}, '_id'); // Lấy danh sách userId
    const notifications = users.map(user => ({
      userId: user._id,
      title: 'Một phim mới sắp được chiếu',
      message: `Phim "${newMovie.title}" sắp được công chiếu, hãy nhanh tay đặt vé nào!`,
      icon: 'movie-outline',
      type: 'info',
    }));
    await Notification.insertMany(notifications);
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo phim", error: err.message });
  }
};

// Lấy danh sách phim

const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find().lean();

    const bookingCounts = await Booking.aggregate([
      {
        $lookup: {
          from: "showtimes",
          localField: "showtime",
          foreignField: "_id",
          as: "showtimeInfo"
        }
      },
      { $unwind: "$showtimeInfo" },
      {
        $group: {
          _id: "$showtimeInfo.movie",
          bookedCount: { $sum: { $size: "$seats" } }
        }
      }
    ]);

    const countMap = {};
    bookingCounts.forEach(item => {
      countMap[item._id.toString()] = item.bookedCount;
    });

    const enrichedMovies = movies.map(movie => ({
      ...movie,
      bookedCount: countMap[movie._id.toString()] || 0
    }));

    res.json(enrichedMovies);
  } catch (err) {
    console.error("Lỗi lấy danh sách phim:", err);
    res.status(500).json({ message: "Lỗi lấy danh sách phim" });
  }
};

// Cập nhật phim
const updateMovie = async (req, res) => {
  try {
    const updated = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy phim" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật phim" });
  }
};

// Xoá phim
const deleteMovie = async (req, res) => {
  try {
    const deleted = await Movie.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy phim" });
    res.json({ message: "Xoá thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xoá phim" });
  }
};

// Tìm kiếm phim
const searchMovies = async (req, res) => {
  try {
    const { title, genre, showtime, keyword } = req.query;

    let query = {};

    // Nếu có keyword thì tìm trong nhiều trường cùng lúc
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { genre: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } }
      ];
    }

    // Nếu có tìm cụ thể theo title
    if (title) {
      query.title = { $regex: title, $options: "i" };
    }

    // Nếu có tìm cụ thể theo thể loại
    if (genre) {
      query.genre = { $regex: genre, $options: "i" };
    }

    // Nếu có tìm cụ thể theo showtime
    if (showtime) {
      query.showtimes = { $in: [new Date(showtime)] };
    }

    const movies = await Movie.find(query);
    if (movies.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy phim nào" });
    }

    res.json({ movies });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tìm kiếm phim", error: error.message });
  }
};



module.exports = {
  createMovie,
  getAllMovies,
  updateMovie,
  deleteMovie,
  searchMovies
};