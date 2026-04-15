/**
 * Room routes — thin handlers delegating to RoomService.
 */
const express = require('express');
const router = express.Router();
const RoomService = require('../services/RoomService');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const apiResponse = require('../utils/apiResponse');

// Create (admin)
router.post('/', authMiddleware, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const room = await RoomService.create(req.body);
    apiResponse(res).created({ room }, 'Thêm phòng thành công');
  } catch (err) {
    next(err);
  }
});

// Get all (admin)
router.get('/', authMiddleware, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const rooms = await RoomService.getAll();
    apiResponse(res).success({ rooms });
  } catch (err) {
    next(err);
  }
});

// Update (admin)
router.put('/:id', authMiddleware, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const room = await RoomService.update(req.params.id, req.body);
    apiResponse(res).success({ room }, 'Cập nhật phòng thành công');
  } catch (err) {
    err.statusCode ? next(err) : res.status(err.statusCode || 500).json({ message: err.message });
  }
});

// Delete (admin)
router.delete('/:id', authMiddleware, authorizeRoles('admin'), async (req, res, next) => {
  try {
    await RoomService.delete(req.params.id);
    apiResponse(res).success(null, 'Đã xoá phòng chiếu');
  } catch (err) {
    err.statusCode ? next(err) : res.status(err.statusCode || 500).json({ message: err.message });
  }
});

module.exports = router;
