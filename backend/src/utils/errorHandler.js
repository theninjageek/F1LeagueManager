// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Error handler utility
const handleError = (err) => {
  const isDev = process.env.NODE_ENV === 'development';
  
  return {
    status: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
    ...(isDev && { stack: err.stack })
  };
};

// Database error mapper
const mapDatabaseError = (err) => {
  const errorMap = {
    '23503': { code: 'FOREIGN_KEY', message: 'Referenced record does not exist' },
    '23505': { code: 'UNIQUE_VIOLATION', message: 'Record already exists' },
    '42P01': { code: 'UNDEFINED_TABLE', message: 'Table does not exist' },
  };
  
  return errorMap[err.code] || { code: 'DB_ERROR', message: err.message };
};

module.exports = { AppError, handleError, mapDatabaseError };