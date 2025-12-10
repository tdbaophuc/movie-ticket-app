const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require('node-cron');
require("dotenv").config();


const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const movieRoutes = require('./routes/movieRoutes');
const showtimeRoutes = require('./routes/showtimeRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const roomRoutes = require('./routes/roomRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const sendReminderNotifications = require("./controllers/scheduleNotification");
const paymentRoutes = require('./routes/paymentRoutes');


const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

cron.schedule('* * * * *', sendReminderNotifications);
// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(5000,'0.0.0.0', () => console.log("Server chạy ở cổng http://0.0.0.0:5000"));
  })
  .catch((err) => console.error("Lỗi kết nối MongoDB:", err));
