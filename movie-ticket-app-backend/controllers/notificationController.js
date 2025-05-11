const Notification = require('../models/Notification');

// Lấy danh sách thông báo của người dùng hiện tại
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy thông báo' });
  }
};

// Đánh dấu 1 thông báo là đã đọc
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật thông báo' });
  }
};

// Tạo thông báo (cho phép gọi từ client nếu cần)
const createNotification = async (req, res) => {
  try {
    const { userId, title, message } = req.body;
    if (!userId || !title || !message) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    const notification = await Notification.create({ userId, title, message });
    res.status(201).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ khi tạo thông báo' });
  }
};

module.exports = { getNotifications, markAsRead, createNotification };
