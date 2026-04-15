/**
 * ShowtimeController — thin HTTP handlers calling ShowtimeService.
 * Refactored from showtimeRoutes.js (removed duplicate generateSeats).
 */
const ShowtimeService = require('../services/ShowtimeService');
const apiResponse = require('../utils/apiResponse');

// POST /api/showtimes
exports.create = async (req, res, next) => {
  try {
    const showtime = await ShowtimeService.create(req.body);
    apiResponse(res).created({ showtime }, 'Tạo suất chiếu thành công');
  } catch (err) {
    next(err);
  }
};

// GET /api/showtimes
exports.getAll = async (req, res, next) => {
  try {
    const showtimes = await ShowtimeService.getAll();
    apiResponse(res).success({ showtimes });
  } catch (err) {
    next(err);
  }
};

// GET /api/showtimes/movie/:movieId
exports.getByMovie = async (req, res, next) => {
  try {
    const showtimes = await ShowtimeService.getByMovie(req.params.movieId);
    apiResponse(res).success({ showtimes });
  } catch (err) {
    next(err);
  }
};

// GET /api/showtimes/:id
exports.getById = async (req, res, next) => {
  try {
    const showtime = await ShowtimeService.getById(req.params.id);
    if (!showtime) return apiResponse(res).error('Suất chiếu không tồn tại', 404);
    apiResponse(res).success({ showtime });
  } catch (err) {
    next(err);
  }
};

// PUT /api/showtimes/:id
exports.update = async (req, res, next) => {
  try {
    const showtime = await ShowtimeService.update(req.params.id, req.body);
    apiResponse(res).success({ showtime }, 'Cập nhật suất chiếu thành công');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/showtimes/:id
exports.delete = async (req, res, next) => {
  try {
    await ShowtimeService.delete(req.params.id);
    apiResponse(res).success(null, 'Đã xoá suất chiếu');
  } catch (err) {
    next(err);
  }
};
