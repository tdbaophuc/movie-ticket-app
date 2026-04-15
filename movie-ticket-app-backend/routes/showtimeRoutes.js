/**
 * Showtime routes — thin wrappers calling ShowtimeController.
 * Removed duplicate generateSeats() — now uses ShowtimeService.generateSeats().
 */
const express = require('express');
const router = express.Router();
const ShowtimeController = require('../controllers/ShowtimeController');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// GET /api/showtimes
router.get('/', ShowtimeController.getAll);

// GET /api/showtimes/:id
router.get('/:id', ShowtimeController.getById);

// GET /api/showtimes/movie/:movieId
router.get('/movie/:movieId', ShowtimeController.getByMovie);

// POST /api/showtimes (admin)
router.post('/', authMiddleware, authorizeRoles('admin'), ShowtimeController.create);

// PUT /api/showtimes/:id (admin)
router.put('/:id', authMiddleware, authorizeRoles('admin'), ShowtimeController.update);

// DELETE /api/showtimes/:id (admin)
router.delete('/:id', authMiddleware, authorizeRoles('admin'), ShowtimeController.delete);

module.exports = router;
