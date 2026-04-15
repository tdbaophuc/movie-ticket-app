/**
 * UserService — user business logic extracted from userRoutes.js.
 * Handles registration, profile, password changes, and admin updates.
 */
const User = require('../models/User');
const Notification = require('../models/Notification');
const sendMail = require('../utils/sendMail');
const logger = require('../utils/logger');

const UserService = {
  /**
   * Register a new customer account.
   * @param {Object} data — { name, email, username, password }
   * @returns {Promise<Object>} created user (without password)
   */
  async register({ name, email, username, password }) {
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const err = new Error('Email hoặc tên đăng nhập đã tồn tại');
      err.statusCode = 400;
      throw err;
    }

    const user = await User.create({ name, email, username, password });
    logger.info('UserService', `New registration: ${username}`);
    return user;
  },

  /**
   * Get a user's profile, stripping sensitive fields.
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('Không tìm thấy người dùng');
      err.statusCode = 404;
      throw err;
    }
    const { password, refreshToken, ...profile } = user.toObject();
    return profile;
  },

  /**
   * Update user profile or status.
   * Sends email + notification when banned or unbanned.
   * Sends self-notification on profile update.
   * @param {Object} params
   * @param {string} params.userId  — target user
   * @param {Object} params.updateData — fields to update (excludes password)
   * @param {string} params.actorId — who is making the change
   * @param {string} params.actorRole — 'admin' | 'customer'
   */
  async updateUser({ userId, updateData, actorId, actorRole }) {
    // Non-admin can only update themselves
    if (actorRole !== 'admin' && actorId !== userId) {
      const err = new Error('Không có quyền cập nhật người dùng này');
      err.statusCode = 403;
      throw err;
    }

    const current = await User.findById(userId);
    if (!current) {
      const err = new Error('Không tìm thấy người dùng');
      err.statusCode = 404;
      throw err;
    }

    const prevStatus = current.status;

    const updated = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true });

    // Side effects on status change
    if (updateData.status === 'banned' && prevStatus !== 'banned') {
      _sendMailSafe({
        to: updated.email,
        subject: 'Tài khoản của bạn đã bị khóa',
        text:
          `Xin chào ${updated.name},\n\n` +
          `Tài khoản của bạn trên hệ thống DNC Cinemas đã bị khóa do vi phạm chính sách hoặc theo quyết định của quản trị viên.\n\n` +
          `Nếu có thắc mắc, vui lòng liên hệ bộ phận hỗ trợ.\n\nTrân trọng,\nDNC Cinemas`,
      });
      _notifySafe(updated._id, {
        title: 'Tài khoản bị khóa',
        message: 'Tài khoản của bạn đã bị khóa bởi quản trị viên. Vui lòng liên hệ để biết thêm chi tiết.',
        icon: 'lock-outline',
        type: 'warning',
      });
    }

    if (updateData.status === 'active' && prevStatus === 'banned') {
      _sendMailSafe({
        to: updated.email,
        subject: 'Tài khoản của bạn đã được mở khóa',
        text:
          `Xin chào ${updated.name},\n\n` +
          `Tài khoản của bạn trên hệ thống DNC Cinemas đã được mở khoá sau khi khiếu nại được giải quyết.\n\n` +
          `Chúc bạn có những trải nghiệm tốt hơn.\n\nTrân trọng,\nDNC Cinemas`,
      });
      _notifySafe(updated._id, {
        title: 'Tài khoản được mở khóa',
        message: 'Tài khoản của bạn đã được mở khóa. Hãy tiếp tục sử dụng dịch vụ.',
        icon: 'lock-open-outline',
        type: 'success',
      });
    }

    // Self-update notification (customer updating own profile)
    if (actorRole !== 'admin' && actorId === userId) {
      _notifySafe(updated._id, {
        title: 'Cập nhật thông tin',
        message: 'Bạn đã cập nhật thông tin tài khoản thành công.',
        icon: 'account-edit-outline',
        type: 'info',
      });
    }

    return updated;
  },

  /**
   * Change a user's password.
   * @param {Object} params
   * @param {string} params.targetUserId — user whose password is changing
   * @param {string} params.actorId — who is making the change
   * @param {string} params.actorRole — 'admin' | 'customer'
   * @param {string} params.oldPassword — required if actor === target
   * @param {string} params.newPassword
   */
  async changePassword({ targetUserId, actorId, actorRole, oldPassword, newPassword }) {
    if (actorId !== targetUserId && actorRole !== 'admin') {
      const err = new Error('Không có quyền cập nhật người dùng này');
      err.statusCode = 403;
      throw err;
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      const err = new Error('Không tìm thấy người dùng');
      err.statusCode = 404;
      throw err;
    }

    // Actor changing own password — verify old password
    if (actorId === targetUserId) {
      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        const err = new Error('Mật khẩu cũ không đúng');
        err.statusCode = 400;
        throw err;
      }
    }

    // Assigning newPassword triggers User.pre('save') hash middleware
    user.password = newPassword;
    await user.save();

    _notifySafe(user._id, {
      title: 'Cập nhật mật khẩu',
      message: 'Bạn đã cập nhật mật khẩu mới thành công.',
      icon: 'password-edit-outline',
      type: 'info',
    });

    logger.info('UserService', `Password changed for user ${targetUserId}`);
  },

  /**
   * Get all users (admin only), stripped of sensitive fields.
   * @returns {Promise<Array>}
   */
  async getAllUsers() {
    return User.find().select('-password -refreshToken').lean();
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Internal helpers — fire-and-forget (failures are non-critical)
// ──────────────────────────────────────────────────────────────────────────────

async function _sendMailSafe({ to, subject, text }) {
  try {
    await sendMail({ to, subject, text });
  } catch (err) {
    logger.error('UserService', 'sendMail failed', { error: err.message });
  }
}

async function _notifySafe(userId, data) {
  try {
    await Notification.create({ userId, ...data });
  } catch (err) {
    logger.error('UserService', 'Notification failed', { error: err.message });
  }
}

module.exports = UserService;
