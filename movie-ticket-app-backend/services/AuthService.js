/**
 * AuthService — auth business logic extracted from auth.js.
 * Centralises login/register/logout/refresh-token.
 * Deduplicates with the duplicate login in userRoutes.js (removed in Phase 3).
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const AuthService = {
  /**
   * Register a new customer account.
   * Role is hard-coded to 'customer' — NEVER from req.body.
   * @param {Object} data — { username, password, name, email }
   */
  async register({ username, password, name, email }) {
    const existing = await User.findOne({ username });
    if (existing) {
      const err = new Error('Tài khoản đã tồn tại');
      err.statusCode = 400;
      throw err;
    }

    const user = await User.create({ username, password, name, email, role: 'customer' });
    logger.info('AuthService', `New registration: ${username}`);
    return user;
  },

  /**
   * Authenticate a user and return tokens.
   * @param {Object} data — { username, password }
   * @returns {Promise<Object>} { accessToken, refreshToken, username, role, userId }
   */
  async login({ username, password }) {
    const user = await User.findOne({ username });
    if (!user) {
      const err = new Error('Tài khoản không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const err = new Error('Sai mật khẩu');
      err.statusCode = 400;
      throw err;
    }

    if (user.status === 'banned') {
      const err = new Error('Tài khoản của bạn đã bị khóa');
      err.statusCode = 403;
      throw err;
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    user.refreshToken = refreshToken;
    await user.save();

    logger.info('AuthService', `Login: ${username}`, { role: user.role });

    return { accessToken, refreshToken, username: user.username, role: user.role, userId: user._id };
  },

  /**
   * Logout — clears refresh token from DB.
   * @param {string} refreshToken
   */
  async logout(refreshToken) {
    if (!refreshToken) {
      const err = new Error('Thiếu refresh token');
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    logger.info('AuthService', 'Logout');
  },

  /**
   * Refresh access token using a valid refresh token.
   * @param {string} refreshToken
   * @returns {string} new accessToken
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      const err = new Error('Thiếu refresh token');
      err.statusCode = 401;
      throw err;
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      const e = new Error('Token không hợp lệ hoặc đã hết hạn');
      e.statusCode = 403;
      throw e;
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    logger.debug('AuthService', 'Token refreshed');
    return { accessToken: newAccessToken };
  },
};

module.exports = AuthService;
