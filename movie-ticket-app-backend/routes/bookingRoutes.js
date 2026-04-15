/**
 * Booking routes — thin wrappers calling BookingController.
 */
const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/BookingController');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// ── Customer routes ────────────────────────────────────────────────────────────
// POST /api/bookings/hold
router.post('/hold', authMiddleware, authorizeRoles('customer'), BookingController.holdSeats);

// POST /api/bookings/pay/:bookingId
router.post('/pay/:bookingId', authMiddleware, authorizeRoles('customer'), BookingController.confirmPayment);

// GET /api/bookings/my
router.get('/my', authMiddleware, authorizeRoles('customer'), BookingController.getMyBookings);

// DELETE /api/bookings/:bookingId
router.delete('/:bookingId', authMiddleware, authorizeRoles('customer'), BookingController.cancelByCustomer);

// GET /api/bookings/reserved-seats/:showtimeId (public)
router.get('/reserved-seats/:showtimeId', BookingController.getReservedSeats);

// GET /api/bookings/successful/:bookingId
router.get('/successful/:bookingId', authMiddleware, authorizeRoles('customer'), BookingController.sendTicketByEmail);

// ── Admin routes ───────────────────────────────────────────────────────────────
// GET /api/bookings/admin/bookings
router.get('/admin/bookings', authMiddleware, authorizeRoles('admin'), BookingController.getAllBookings);

// PUT /api/bookings/admin/bookings/:bookingId
router.put('/admin/bookings/:bookingId', authMiddleware, authorizeRoles('admin'), BookingController.updateBooking);

// DELETE /api/bookings/admin/bookings/:bookingId
router.delete('/admin/bookings/:bookingId', authMiddleware, authorizeRoles('admin'), BookingController.cancelByAdmin);

module.exports = router;
