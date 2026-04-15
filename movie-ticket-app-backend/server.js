/**
 * Server entry point — wires up Express with all routes, middleware,
 * scheduled jobs, and database connection.
 */
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");

const authRoutes       = require("./routes/auth");
const userRoutes       = require("./routes/userRoutes");
const movieRoutes     = require("./routes/movieRoutes");
const showtimeRoutes  = require("./routes/showtimeRoutes");
const bookingRoutes   = require("./routes/bookingRoutes");
const roomRoutes      = require("./routes/roomRoutes");
const notificationRoutes  = require("./routes/notificationRoutes");
const NotificationService = require("./services/NotificationService");
const paymentRoutes   = require("./routes/paymentRoutes");
const errorHandler    = require("./middleware/errorHandler");
const logger          = require("./utils/logger");
const BookingService = require("./services/BookingService");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/user",          userRoutes);
app.use("/api/movies",        movieRoutes);
app.use("/api/bookings",      bookingRoutes);
app.use("/api/rooms",         roomRoutes);
app.use("/api/showtimes",     showtimeRoutes);
app.use("/api/payment",       paymentRoutes);
app.use("/api/notifications", notificationRoutes);

// ── Global error handler (MUST be last) ──────────────────────────────────────
app.use(errorHandler);

// ── Scheduled jobs ───────────────────────────────────────────────────────────
// 1. Reminder notifications — every minute
cron.schedule("* * * * *", () => {
  NotificationService.sendShowtimeReminders().catch((err) =>
    logger.error("Cron", "Reminder notifications failed", { error: err.message })
  );
});

// 2. Expire stale pending bookings — every 60 seconds (using BookingService)
setInterval(async () => {
  try {
    const count = await BookingService.cleanExpiredBookings();
    if (count > 0) {
      console.log(`[BookingCleaner] Cancelled ${count} expired booking(s)`);
    }
  } catch (err) {
    logger.error("Cron", "BookingCleaner failed", { error: err.message });
  }
}, 60 * 1000);

// ── MongoDB ───────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info("Server", "MongoDB connected");
    app.listen(5000, "0.0.0.0", () => {
      logger.info("Server", "Server running on http://0.0.0.0:5000");
    });
  })
  .catch((err) => {
    logger.error("Server", "MongoDB connection failed", { error: err.message });
    process.exit(1);
  });
