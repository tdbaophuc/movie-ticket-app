/**
 * Notification routes — thin wrappers calling NotificationController.
 */
const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { authMiddleware } = require('../middleware/auth');

// GET /api/notifications
router.get('/', authMiddleware, NotificationController.getAll);

// POST /api/notifications
router.post('/', authMiddleware, NotificationController.create);

// PUT /api/notifications/:id/read
router.put('/:id/read', authMiddleware, NotificationController.markAsRead);

// PUT /api/notifications/read-all
router.put('/read-all', authMiddleware, NotificationController.markAllAsRead);

module.exports = router;
