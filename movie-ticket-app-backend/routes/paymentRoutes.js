const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// API tạo thanh toán
router.post('/momo', paymentController.createPayment);

module.exports = router;