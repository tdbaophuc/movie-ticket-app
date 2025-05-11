const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Showtime = require("../models/Showtime");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const stream = require("stream");
const path = require("path"); 
const nodemailer = require("nodemailer");  
const { createTransport } = require('nodemailer');
const getStream = require("get-stream"); 
const fs = require("fs");
const Notification = require("../models/Notification"); 




const { authMiddleware, authorizeRoles } = require("../middleware/auth");
const { title } = require("process");

// 1. Tạm giữ vé (chờ thanh toán)
router.post("/hold", authMiddleware, authorizeRoles("customer"), async (req, res) => {
  try {
    const { showtimeId, seats } = req.body;

    // Kiểm tra ghế đã được đặt/tạm giữ
    const existingBookings = await Booking.find({
      showtime: showtimeId,
      status: { $ne: "cancelled" },
    });
    const alreadyBookedSeats = existingBookings.flatMap((b) => b.seats);
    const overlap = seats.filter((seat) => alreadyBookedSeats.includes(seat));
    if (overlap.length > 0) {
      return res.status(400).json({ message: `Ghế đã có người giữ/đặt: ${overlap.join(", ")}` });
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    const booking = new Booking({
      user: req.user.id,
      showtime: showtimeId,
      seats,
      status: "pending",
      expiresAt,
    });

    await booking.save();

    res.status(201).json({ message: "Tạm giữ vé thành công. Vui lòng thanh toán trong 5 phút.", booking });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạm giữ vé", error: error.message });
  }
});

// 2. Thanh toán vé
router.post("/pay/:bookingId", authMiddleware, authorizeRoles("customer"), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate("showtime");

    if (!booking || booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Không tìm thấy vé hoặc không thuộc về bạn" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Vé không ở trạng thái chờ thanh toán" });
    }

    if (new Date() > booking.expiresAt) {
      booking.status = "cancelled";
      await booking.save();
      return res.status(400).json({ message: "Vé đã hết hạn, vui lòng đặt lại" });
    }

    // Cập nhật trạng thái ghế trong suất chiếu
    const showtime = await Showtime.findById(booking.showtime._id);
    booking.seats.forEach((seat) => {
      const seatIndex = showtime.seats.findIndex((s) => s.seatNumber === seat);
      if (seatIndex !== -1) {
        showtime.seats[seatIndex].isBooked = true;
      }
    });
    await showtime.save();

    booking.status = "paid";
    booking.createdAt = new Date();
    await booking.save();
    
    

    res.json({ message: "Thanh toán thành công. Vé đã được đặt.", booking });
    await Notification.create({
  userId: req.user.id,
  title: 'Đặt vé thành công',
  message: 'Bạn đã đặt vé thành công cho suất chiếu lúc ' + booking.showtime.dateTime.toLocaleString(),
  icon: 'ticket-outline', 
  type: 'success',
});
    
  } catch (error) {
    res.status(500).json({ message: "Lỗi thanh toán vé", error: error.message });
  }
});

// 3. Xem vé của chính mình
router.get("/my", authMiddleware, authorizeRoles("customer"), async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: "showtime",
        populate: [
          { path: "movie", select: "title poster" },
          { path: "room", select: "name" },
        ]
      })
      .select("seats showtime status")   
      .exec();  

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "Không có vé nào" });
    }

    // Tạo danh sách bookings mới có qrCode
    const bookingsWithQr = await Promise.all(bookings.map(async (booking) => {
      let qrCode = null;
      if (booking.status === "paid") {
        try {
          const qrContent = `${booking._id}`;
          qrCode = await QRCode.toDataURL(qrContent);
          
        } catch (error) {
          console.error(`Lỗi tạo mã QR cho booking ${booking._id}:`, error.message);
        }
      }
      return {
        _id: booking._id,
        seats: booking.seats,
        status: booking.status,
        showtime: booking.showtime,
        qrCode: qrCode,
      };
    }));

    res.json({ bookings: bookingsWithQr });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi lấy danh sách vé", error: error.message });
  }
});


// 4. Huỷ vé (chỉ chủ vé, trước giờ chiếu 1 tiếng)
router.delete("/:bookingId", authMiddleware, authorizeRoles("customer"), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate("showtime");

    if (!booking || booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bạn không có quyền huỷ vé này" });
    }

    const showtimeTime = new Date(booking.showtime.datetime);
    const now = new Date();
    const oneHourBefore = new Date(showtimeTime.getTime() - 60 * 60 * 1000);

    if (now >= oneHourBefore) {
      return res.status(400).json({ message: "Đã quá thời gian huỷ vé (chỉ huỷ trước giờ chiếu 1 tiếng)" });
    }

    // Gỡ trạng thái isBooked trong suất chiếu nếu vé đã thanh toán
    if (booking.status === "paid") {
      const showtime = await Showtime.findById(booking.showtime._id);
      booking.seats.forEach((seatNumber) => {
        const seatIndex = showtime.seats.findIndex((s) => s.seatNumber === seatNumber);
        if (seatIndex !== -1) {
          showtime.seats[seatIndex].isBooked = false;
        }
      });
      await showtime.save();
    }

    await Booking.findByIdAndDelete(req.params.bookingId);

    

    res.json({ message: "Đã huỷ vé thành công" });
    await Notification.create({
            userId: req.user.id,
            title: 'Huỷ vé thành công',
            message: 'Bạn đã huỷ vé thành công cho suất chiếu lúc ' + booking.showtime.dateTime.toLocaleString(),
            icon: 'ticket-outline', 
            type: 'success',
          });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi huỷ vé", error: error.message });
  }
});

// 5. Lấy danh sách ghế đã đặt cho suất chiếu
router.get("/reserved-seats/:showtimeId", async (req, res) => {
  try {
    const bookings = await Booking.find({
      showtime: req.params.showtimeId,
      status: { $ne: "cancelled" }
    });
    const reservedSeats = bookings.flatMap(booking => booking.seats);
    res.json({ reservedSeats });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy ghế đã đặt", error: error.message });
  }
});

// 1. Xem tất cả vé (Admin)
router.get("/admin/bookings", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const bookings = await Booking.find().populate({
      path: "showtime",
      populate: [
        { path: "movie", select: "title poster" },
        { path: "room", select: "name" }
      ]
    })
    .populate("user", "name email")
    .exec();

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "Không có vé nào" });
    }

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách vé", error: error.message });
  }
});


// 2. Sửa thông tin vé (Admin)
router.put("/admin/bookings/:bookingId", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate("showtime");

    if (!booking) {
      return res.status(404).json({ message: "Không tìm thấy vé" });
    }

    if (req.body.seats) {
      const seats = req.body.seats;

      // Kiểm tra xem các ghế mới có bị trùng không
      const existingBookings = await Booking.find({
        showtime: booking.showtime._id,
        _id: { $ne: booking._id }, // bỏ qua chính vé đang sửa
        status: { $ne: "cancelled" }
      });

      const alreadyBookedSeats = existingBookings.flatMap((b) => b.seats);
      const overlap = seats.filter((seat) => alreadyBookedSeats.includes(seat));
      if (overlap.length > 0) {
        return res.status(400).json({ message: `Ghế đã có người giữ/đặt: ${overlap.join(", ")}` });
      }

      booking.seats = seats;
    }

    await booking.save();

    

    res.json({ message: "Thông tin vé đã được cập nhật", booking });
    await Notification.create({
            userId: req.user.id,
            title: 'Vé đã được cập nhật',
            message: 'Thông tin vé đã được quản trị viên cập nhật.',
            icon: 'ticket-edit-outline', 
            type: 'warning',
          });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi sửa vé", error: error.message });
  }
});

// 3. Huỷ vé (Admin)
router.delete("/admin/bookings/:bookingId", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate("showtime");

    if (!booking) {
      return res.status(404).json({ message: "Không tìm thấy vé" });
    }

    // Gỡ trạng thái isBooked trong suất chiếu nếu vé đã thanh toán
    if (booking.status === "paid") {
      const showtime = await Showtime.findById(booking.showtime._id);
      booking.seats.forEach((seatNumber) => {
        const seatIndex = showtime.seats.findIndex((s) => s.seatNumber === seatNumber);
        if (seatIndex !== -1) {
          showtime.seats[seatIndex].isBooked = false;
        }
      });
      await showtime.save();
    }
    booking.status = "cancelled";
    await booking.save();

    
    res.json({ message: "Đã huỷ vé thành công" });
    await Notification.create({
            userId: req.user.id,
            title: 'Vé đã bị huỷ',
            message: 'Vé đã bị huỷ bởi quản trị viên.',
            icon: 'ticket-outline', 
            type: 'warning',
          });

  } catch (error) {
    res.status(500).json({ message: "Lỗi khi huỷ vé", error: error.message });
  }
});




// Gửi vé về mail

router.get("/successful/:bookingId", authMiddleware, authorizeRoles("customer"), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate({
        path: "showtime",
        populate: [
          { path: "movie", select: "title" },
          { path: "room", select: "name" }
        ]
      })
      .populate({ path: "user", select: "name email" });

    if (!booking || booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Không có quyền truy cập vé này" });
    }

    if (booking.status !== "paid") {
      return res.status(400).json({ message: "Chỉ có thể gửi vé đã thanh toán" });
    }

    const qrContent = `Mã vé: ${booking._id}\nTên phim: ${booking.showtime.movie.title}\nGhế: ${booking.seats.join(", ")}`;
    const qrDataURL = await QRCode.toDataURL(qrContent);
    const qrImage = qrDataURL.replace(/^data:image\/png;base64,/, "");
    const imgBuffer = Buffer.from(qrImage, "base64");

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });

const fontPath = path.join(__dirname, "../fonts/Roboto-Regular.ttf");
doc.registerFont("Roboto", fontPath);
doc.font("Roboto");

const pageWidth = doc.page.width;
const pageHeight = doc.page.height;
const margin = 40;

const primaryColor = "#1e40af"; // Xanh đậm
const secondaryColor = "#fb923c"; // Cam
const borderColor = "#e5e7eb"; // Xám nhạt
const textColor = "#111827";

const bufferStream = new stream.PassThrough();
doc.pipe(bufferStream);

// Logo + Tên rạp phía trên
const logoPath = path.join(__dirname, "../assets/logo.png");
if (fs.existsSync(logoPath)) {
  doc.image(logoPath, margin + 10, margin + 10, { width: 80 });
}
doc
  .fillColor(primaryColor)
  .fontSize(28)
  .text("DNC CINEMAS", margin + 110, margin + 25);

// Tiêu đề vé
doc
  .fillColor(secondaryColor)
  .fontSize(20)
  .text("🎟️ VÉ XEM PHIM", pageWidth - margin - 200, margin + 35, { align: "right" });

// Kẻ viền vé chính
const contentTop = margin + 80;
const contentHeight = pageHeight - contentTop - margin;
const qrBoxSize = 180;
const contentWidth = pageWidth - margin * 2;
const infoBoxWidth = contentWidth - qrBoxSize - 40;

doc
  .roundedRect(margin, contentTop, contentWidth, contentHeight, 12)
  .stroke(borderColor);

// Khung bên trái: Thông tin vé
doc
  .roundedRect(margin + 20, contentTop + 20, infoBoxWidth, contentHeight - 40, 8)
  .stroke(borderColor);

doc
  .fontSize(14)
  .fillColor(textColor)
  .text(`Tên phim: ${booking.showtime.movie.title}`, margin + 40, contentTop + 40)
  .moveDown(0.5)
  .text(`Ngày chiếu: ${new Date(booking.showtime.dateTime).toLocaleString()}`)
  .moveDown(0.5)
  .text(`Phòng chiếu: ${booking.showtime.room.name}`)
  .moveDown(0.5)
  .text(`Ghế: ${booking.seats.join(", ")}`)
  .moveDown(0.5)
  .text(`Mã vé: ${booking._id}`)
  .moveDown(0.5)
  .text(`Khách hàng: ${booking.user.name}`);

// QR Code bên phải
const qrX = pageWidth - margin - qrBoxSize;
doc
  .roundedRect(qrX, contentTop + 40, qrBoxSize, qrBoxSize, 8)
  .stroke(borderColor);

doc.image(imgBuffer, qrX + 15, contentTop + 55, {
  fit: [qrBoxSize - 30, qrBoxSize - 30],
  align: "center",
});



doc.end();


    const pdfBuffer = await getStream.buffer(bufferStream);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"DNC Cinemas" <${process.env.EMAIL_USER}>`,
      to: booking.user.email,
      subject: `Vé xem phim DNC Cinemas - Mã vé: ${booking._id}`,
      text: `Xin chào ${booking.user.name},\n\nCảm ơn bạn đã đặt vé tại DNC Cinemas. Vé xem phim của bạn được đính kèm trong email này dưới dạng file PDF.\n\nChúc bạn xem phim vui vẻ!\n\nTrân trọng,\nDNC Cinemas`,
      attachments: [
        {
          filename: `ve_${booking._id}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Lỗi khi gửi email:", error);
        return res.status(500).json({ message: "Gửi email thất bại", error });
      }
      console.log("Email đã gửi:", info.response);
      res.status(200).json({ message: "Vé đã được gửi về email của bạn." });
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi khi gửi vé", error: error.message });
  }
});


module.exports = router;
