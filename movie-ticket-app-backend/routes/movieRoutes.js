/**
 * Movie routes — thin handlers delegating to MovieService.
 */
const express = require('express');
const router = express.Router();
const MovieService = require('../services/MovieService');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const apiResponse = require('../utils/apiResponse');

// Get all (public)
router.get('/', async (req, res, next) => {
  try {
    const movies = await MovieService.getAll();
    apiResponse(res).success({ movies });
  } catch (err) {
    next(err);
  }
});

// Search (public)
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    const movies = await MovieService.search(q || '');
    apiResponse(res).success({ movies });
  } catch (err) {
    next(err);
  }
});

// Create (admin)
router.post('/', authMiddleware, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const movie = await MovieService.create(req.body);
    apiResponse(res).created({ movie }, 'Tạo phim thành công');
  } catch (err) {
    next(err);
  }
});

// Update (admin)
router.put('/:id', authMiddleware, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const movie = await MovieService.update(req.params.id, req.body);
    apiResponse(res).success({ movie }, 'Cập nhật phim thành công');
  } catch (err) {
    err.statusCode ? next(err) : res.status(err.statusCode || 500).json({ message: err.message });
  }
});

// Delete (admin)
router.delete('/:id', authMiddleware, authorizeRoles('admin'), async (req, res, next) => {
  try {
    await MovieService.delete(req.params.id);
    apiResponse(res).success(null, 'Đã xoá phim');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
