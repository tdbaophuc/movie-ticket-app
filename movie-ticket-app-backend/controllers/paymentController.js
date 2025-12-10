const axios = require('axios');
const crypto = require('crypto');

// Cấu hình tài khoản Test MoMo
const config = {
    partnerCode: 'MOMO',
    accessKey: 'F8BBA842ECF85',
    secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
    endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create'
};

exports.createPayment = async (req, res) => {
    try {
        const { totalAmount, bookingId, redirectUrl } = req.body;

        const date = new Date();
        const requestId = bookingId + '-' + date.getTime();
        const orderId = requestId;
        const orderInfo = "Thanh toan ve DNC Cinemas";
        const ipnUrl = "https://momo.vn";
        const requestType = "captureWallet";
        const extraData = ""; 
        const amount = totalAmount.toString();

        const rawSignature = `accessKey=${config.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${config.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

        // Mã hoá HMAC SHA256
        const signature = crypto.createHmac('sha256', config.secretKey)
            .update(rawSignature)
            .digest('hex');

        const requestBody = {
            partnerCode: config.partnerCode,
            partnerName: "DNC Cinemas",
            storeId: "MomoTestStore",
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: redirectUrl,
            ipnUrl: ipnUrl,
            lang: 'vi',
            requestType: requestType,
            autoCapture: true,
            extraData: extraData,
            signature: signature
        };

        const response = await axios.post(config.endpoint, requestBody);

        console.log("MoMo Response:", response.data);

        return res.status(200).json(response.data);

    } catch (error) {
        console.error("MoMo Error:", error.response ? error.response.data : error.message);
        return res.status(500).json({ message: "Lỗi tạo thanh toán MoMo" });
    }
};