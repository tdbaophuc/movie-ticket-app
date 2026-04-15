/**
 * PaymentController — replaced existing paymentController.js.
 * Delegates MoMo payment creation to PaymentService.
 */
const PaymentService = require('../services/PaymentService');

exports.createPayment = async (req, res, next) => {
  try {
    const { totalAmount, bookingId, redirectUrl } = req.body;
    const result = await PaymentService.createMoMoPayment({ totalAmount, bookingId, redirectUrl });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
