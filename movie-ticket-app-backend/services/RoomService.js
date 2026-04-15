/**
 * RoomService — thin CRUD service.
 */
const Room = require('../models/Room');

const RoomService = {
  /**
   * Create a new room.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async create(data) {
    return Room.create(data);
  },

  /**
   * Get all rooms.
   * @returns {Promise<Array>}
   */
  async getAll() {
    return Room.find().lean();
  },

  /**
   * Update a room by ID.
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    const room = await Room.findByIdAndUpdate(id, data, { new: true });
    if (!room) {
      const err = new Error('Không tìm thấy phòng chiếu');
      err.statusCode = 404;
      throw err;
    }
    return room;
  },

  /**
   * Delete a room by ID.
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    const room = await Room.findByIdAndDelete(id);
    if (!room) {
      const err = new Error('Không tìm thấy phòng chiếu');
      err.statusCode = 404;
      throw err;
    }
  },
};

module.exports = RoomService;
