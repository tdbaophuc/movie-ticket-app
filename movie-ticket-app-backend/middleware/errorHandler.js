// Global error handler — must be registered LAST (after all routes)
const errorHandler = (err, req, res, next) => {
  // Log full stack in development, sanitized in production
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', err.stack);
  } else {
    console.error('[Error]', err.message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Validation failed', errors: messages });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ message: `${field} already exists` });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token đã hết hạn' });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
