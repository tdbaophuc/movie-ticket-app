/**
 * PaymentService — MoMo payment integration extracted from paymentController.js.
 */
const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');

const PaymentService = {
  /**
   * Create a MoMo payment URL.
   * @param {Object} params
   * @param {number} params.totalAmount
   * @param {string} params.bookingId
   * @param {string} params.redirectUrl
   * @returns {Promise<Object>} MoMo API response (contains payUrl)
   */
  async createMoMoPayment({ totalAmount, bookingId, redirectUrl }) {
    const requestId = `${bookingId}-${Date.now()}`;
    const orderInfo = 'Thanh toan ve DNC Cinemas';
    const ipnUrl = process.env.MOMO_IPN_URL || 'https://momo.vn';
    const requestType = 'captureWallet';
    const extraData = '';

    const rawSignature =
      `accessKey=${process.env.MOMO_ACCESS_KEY}` +
      `&amount=${totalAmount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${requestId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${process.env.MOMO_PARTNER_CODE}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = crypto
      .createHmac('sha256', process.env.MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      partnerCode: process.env.MOMO_PARTNER_CODE,
      partnerName: 'DNC Cinemas',
      storeId: process.env.MOMO_STORE_ID || 'MomoTestStore',
      requestId,
      amount: String(totalAmount),
      orderId: requestId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: 'vi',
      requestType,
      autoCapture: true,
      extraData,
      signature,
    };

    logger.info('PaymentService', 'Creating MoMo payment', { bookingId, requestId });

    const response = await axios.post(process.env.MOMO_ENDPOINT, requestBody);
    return response.data;
  },
};

module.exports = PaymentService;
