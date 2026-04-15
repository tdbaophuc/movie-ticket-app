/**
 * Auth routes — thin wrappers calling AuthController.
 */
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

// POST /api/auth/register
router.post('/register', AuthController.register);

// POST /api/auth/login
router.post('/login', AuthController.login);

// POST /api/auth/logout
router.post('/logout', AuthController.logout);

// POST /api/auth/refresh-token
router.post('/refresh-token', AuthController.refreshToken);

module.exports = router;
