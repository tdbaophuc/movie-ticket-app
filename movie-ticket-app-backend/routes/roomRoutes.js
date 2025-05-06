const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const { authMiddleware, authorizeRoles } = require("../middleware/auth");

// Thêm phòng
router.post("/", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: "Lỗi thêm phòng", error: err.message });
  }
});

// Lấy danh sách phòng
router.get("/", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách phòng", error: err.message });
  }
});

// Sửa phòng
router.put("/:id", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const updated = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật phòng", error: err.message });
  }
});

// Xoá phòng
router.delete("/:id", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xoá phòng chiếu" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xoá phòng", error: err.message });
  }
});

module.exports = router;
