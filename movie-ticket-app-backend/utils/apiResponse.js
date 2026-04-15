/**
 * Standard API response wrapper — ensures consistent response shape
 * across all endpoints.
 *
 * Success:   { success: true, data: {...}, message: '...' }
 * Error:     { success: false, error: '...', details?: [...] }
 */

function apiResponse(res) {
  return {
    success: (data, message = null) =>
      res.status(200).json({ success: true, data, message }),
    created: (data, message = null) =>
      res.status(201).json({ success: true, data, message }),
    noContent: () => res.status(204).send(),
    error: (message, statusCode = 500, details = null) =>
      res.status(statusCode).json({ success: false, error: message, ...(details && { details }) }),
  };
}

module.exports = apiResponse;