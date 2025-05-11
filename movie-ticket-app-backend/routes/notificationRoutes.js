const express = require('express');
const {
  getNotifications,
  markAsRead,
  createNotification
} = require('../controllers/notificationController');

const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// Tạo thông báo mới
router.post('/', authMiddleware, createNotification);

// Lấy danh sách thông báo
router.get('/', authMiddleware, getNotifications);

// Đánh dấu là đã đọc
router.put('/:id/read', authMiddleware, markAsRead);

module.exports = router;
