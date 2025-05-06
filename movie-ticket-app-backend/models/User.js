// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Vui lòng nhập họ tên"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Vui lòng nhập email"],
    unique: true,
    trim: true,
    match: [/.+\@.+\..+/, "Email không hợp lệ"],
  },
  username: {
    type: String,
    required: [true, "Vui lòng nhập tên đăng nhập"],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Vui lòng nhập mật khẩu"],
    minlength: [6, "Mật khẩu phải ít nhất 6 ký tự"],
  },
  role: {
    type: String,
    enum: ['admin', 'customer'],
    default: 'customer',
  },
  refreshToken: { type: String }, 
});

// Middleware: mã hóa mật khẩu trước khi lưu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Nếu chưa đổi password thì bỏ qua

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    return next(err);
  }
});

// So sánh mật khẩu nhập vào với mật khẩu trong database
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
