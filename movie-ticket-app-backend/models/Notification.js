// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  icon: { type: String, default: 'bell-outline' },
  type: { type: String, enum: ['info', 'warning', 'success'], default: 'info' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  referenceId: { type: mongoose.Schema.Types.ObjectId, default: null }
});

module.exports = mongoose.model('Notification', notificationSchema);
