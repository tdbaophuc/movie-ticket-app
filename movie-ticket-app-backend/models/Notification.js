// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  icon: { type: String, default: 'bell-outline' },
  type: { type: String, enum: ['info', 'warning', 'success'], default: 'info' },
  isRead: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId, default: null }
});

// Index: fetch unread notifications for a user quickly
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
