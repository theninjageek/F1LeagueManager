// Standardized response wrapper
const sendSuccess = (res, data, statusCode = 200, message = null) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const sendError = (res, statusCode, message, details = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && details && { details })
  });
};

module.exports = { sendSuccess, sendError };