const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Route đăng ký người dùng
router.post('/register', async (req, res) => {
  const { name, email, username, password } = req.body;

  try {
    // Kiểm tra xem email hoặc username có tồn tại không
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email hoặc tên đăng nhập đã tồn tại' });
    }

    // Tạo người dùng mới
    const newUser = new User({ name, email, username, password });
    await newUser.save();

    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Lỗi khi đăng ký', error: error.message });
  }
});

// Route đăng nhập người dùng 
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Tìm người dùng với tên đăng nhập
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    // Tạo token
    const payload = { id: user._id, role: user.role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Trả về token cho người dùng
    res.json({
      accessToken,
      refreshToken,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi đăng nhập', error: error.message });
  }
});

// Route chỉ dành cho admin
router.get('/admin', authMiddleware, authorize(['admin']), (req, res) => {
  res.json({ message: `Chào Admin ${req.user.id}` });
});

// Route chỉ dành cho customer
router.get('/customer', authMiddleware, authorize(['customer']), (req, res) => {
  res.json({ message: `Chào khách hàng ${req.user.id}` });
});

/// Route cập nhật thông tin người dùng
router.put('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // Nếu không phải admin, chỉ được cập nhật chính mình
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Không có quyền cập nhật người dùng này' });
    }

    // Kiểm tra nếu body có password, loại bỏ nó
    const { password, ...updateData } = req.body;

    // Cập nhật dữ liệu người dùng (không bao gồm password)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({ message: 'Cập nhật thành công', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật người dùng', error: error.message });
  }
});

// Route đổi mật khẩu: cho phép truyền userId qua URL
router.put("/change-password/:userId", authMiddleware, async (req, res) => {
  const requestUserId = req.user.id;          // từ token
  const targetUserId = req.params.userId;     // từ URL
  const { oldPassword, newPassword } = req.body;

  // Nếu người dùng không phải chính họ và cũng không phải admin thì từ chối
  if (requestUserId !== targetUserId && req.user.role !== "admin") {
    return res.status(403).json({ message: "Không có quyền cập nhật người dùng này" });
  }

  try {
    const user = await User.findById(targetUserId);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    // Nếu là chính người đó đổi mật khẩu thì cần xác minh mật khẩu cũ
    if (requestUserId === targetUserId) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
    }

    // Hash mật khẩu mới
    user.password = newPassword; // middleware hash
    await user.save();


    res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi cập nhật người dùng", error: error.message });
  }
});

// Route lấy thông tin người dùng
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // Tìm người dùng theo ID
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Trả về thông tin người dùng (loại bỏ mật khẩu và refreshToken)
    const { password, refreshToken, ...userData } = user.toObject();
    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng', error: error.message });
  }
});

// Lấy danh sách tất cả người dùng (chỉ dành cho admin)
router.get('/admin/users', authMiddleware, authorize(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password -refreshToken');
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
});


module.exports = router;
