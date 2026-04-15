/**
 * User routes — thin wrappers calling UserController.
 * NOTE: login/register removed here — unified in auth.js to avoid duplicate auth logic.
 * Kept: profile, password change, admin user list, admin status update.
 */
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// GET /api/user/me
router.get('/me', authMiddleware, UserController.getProfile);

// PUT /api/user/:userId
router.put('/:userId', authMiddleware, UserController.updateUser);

// PUT /api/user/change-password/:userId
router.put('/change-password/:userId', authMiddleware, UserController.changePassword);

// GET /api/user/admin/users (admin)
router.get('/admin/users', authMiddleware, authorizeRoles('admin'), UserController.getAllUsers);

module.exports = router;
