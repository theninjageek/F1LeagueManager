const { handleError, mapDatabaseError } = require('../utils/errorHandler');

const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    code: err.code
  });

  // Database errors
  if (err.code) {
    const dbError = mapDatabaseError(err);
    return res.status(400).json({
      success: false,
      message: dbError.message,
      code: dbError.code,
      ...(process.env.NODE_ENV === 'development' && { originalError: err.message })
    });
  }

  // Custom app errors
  const errorResponse = handleError(err);
  return res.status(errorResponse.status).json({
    success: false,
    message: errorResponse.message,
    ...(errorResponse.stack && { stack: errorResponse.stack })
  });
};

module.exports = errorHandler;