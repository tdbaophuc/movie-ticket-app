// middleware/auth.js
const jwt = require("jsonwebtoken");

// Middleware xác thực JWT
const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  // Kiểm tra header có token không và định dạng có đúng không
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Chưa đăng nhập hoặc thiếu token" });
  }

  const token = authHeader.split(" ")[1]; // Lấy phần token sau từ "Bearer"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc hết hạn" });
  }
};

// Middleware phân quyền (cho phép một số vai trò truy cập)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập tài nguyên này" });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  authorizeRoles,
};
