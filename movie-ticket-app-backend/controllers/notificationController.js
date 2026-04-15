/**
 * NotificationController — thin HTTP handlers calling NotificationService.
 */
const NotificationService = require('../services/NotificationService');
const apiResponse = require('../utils/apiResponse');

// GET /api/notifications
exports.getAll = async (req, res, next) => {
  try {
    const notifications = await NotificationService.getAll(req.user.id);
    const unreadCount = await NotificationService.getUnreadCount(req.user.id);
    apiResponse(res).success({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

// POST /api/notifications
exports.create = async (req, res, next) => {
  try {
    const notification = await NotificationService.create(req.user.id, req.body);
    apiResponse(res).created({ notification }, 'Tạo thông báo thành công');
  } catch (err) {
    next(err);
  }
};

// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await NotificationService.markAsRead(req.params.id, req.user.id);
    if (!notification) return apiResponse(res).error('Không tìm thấy thông báo', 404);
    apiResponse(res).success({ notification });
  } catch (err) {
    next(err);
  }
};

// PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res, next) => {
  try {
    await NotificationService.markAllAsRead(req.user.id);
    apiResponse(res).success(null, 'Đã đánh dấu tất cả là đã đọc');
  } catch (err) {
    next(err);
  }
};
