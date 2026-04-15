/**
 * MovieService — thin CRUD service.
 * Full business logic (broadcast notifications, etc.) added in Phase 1.
 */
const Movie = require('../models/Movie');

const MovieService = {
  /**
   * Get all movies.
   * @returns {Promise<Array>}
   */
  async getAll() {
    return Movie.find().sort({ createdAt: -1 }).lean();
  },

  /**
   * Search movies by title or genre.
   * @param {string} q
   * @returns {Promise<Array>}
   */
  async search(q) {
    if (!q || q.trim() === '') return this.getAll();
    const regex = new RegExp(q.trim(), 'i');
    return Movie.find({
      $or: [{ title: regex }, { genre: regex }],
    }).lean();
  },

  /**
   * Create a new movie.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async create(data) {
    return Movie.create(data);
  },

  /**
   * Update a movie by ID.
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    const movie = await Movie.findByIdAndUpdate(id, data, { new: true });
    if (!movie) {
      const err = new Error('Không tìm thấy phim');
      err.statusCode = 404;
      throw err;
    }
    return movie;
  },

  /**
   * Delete a movie by ID.
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    const movie = await Movie.findByIdAndDelete(id);
    if (!movie) {
      const err = new Error('Không tìm thấy phim');
      err.statusCode = 404;
      throw err;
    }
  },
};

module.exports = MovieService;
