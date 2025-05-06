const express = require("express");
const router = express.Router();
const { authMiddleware, authorizeRoles } = require("../middleware/auth");
const movieController = require("../controllers/movieController");

// API CRUD phim (chỉ admin)
router.post("/", authMiddleware, authorizeRoles("admin"), movieController.createMovie);
router.get("/", movieController.getAllMovies); // ai cũng có thể xem danh sách
router.put("/:id", authMiddleware, authorizeRoles("admin"), movieController.updateMovie);
router.delete("/:id", authMiddleware, authorizeRoles("admin"), movieController.deleteMovie);

// API tìm kiếm phim (tất cả người dùng)
router.get("/search", movieController.searchMovies);

module.exports = router;
