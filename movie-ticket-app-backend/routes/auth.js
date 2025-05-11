// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// ĐĂNG KÝ
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email, role } = req.body;

    // Kiểm tra tài khoản đã tồn tại chưa
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Tài khoản đã tồn tại' });
    }

    // Nếu không có role, gán mặc định là 'user'
    const userRole = role || 'user';

    // Tạo tài khoản mới
    const newUser = new User({ username, password, name, email, role: userRole });
    await newUser.save();

    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// ĐĂNG NHẬP
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Sai mật khẩu' });
    }

    const status = await user.status;
    if (status === 'banned') {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị thêm vào danh sách đen' });
    }

    // Access Token (ngắn hạn)
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // 15 phút
    );

    // Refresh Token (dài hạn)
    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    
    // Lưu refresh token vào DB
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      username: user.username,
      role: user.role,
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// LOGOUT
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(400).json({ message: 'Thiếu refresh token' });

  try {
    // Tìm user có refresh token này
    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(400).json({ message: 'Không tìm thấy người dùng' });

    // Xoá refresh token khỏi DB
    user.refreshToken = null;
    await user.save();

    res.json({ message: 'Đăng xuất thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// REFRESH TOKEN
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(401).json({ message: 'Thiếu refresh token' });

  try {
    // Tìm user với refreshToken
    const user = await User.findOne({ refreshToken });
    // if (!user) return res.status(403).json({ message: 'Token không hợp lệ' });

    // Xác thực token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Tạo access token mới
    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
});


module.exports = router;
