const { AppError } = require('./errorHandler');
const { SESSION_TYPES, ERROR_MESSAGES } = require('../constants');

const validateSessionType = (sessionType) => {
  if (!Object.values(SESSION_TYPES).includes(sessionType)) {
    throw new AppError(
      `${ERROR_MESSAGES.INVALID_SESSION_TYPE}. Valid types: ${Object.values(SESSION_TYPES).join(', ')}`,
      400
    );
  }
};

const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start >= end) {
    throw new AppError(ERROR_MESSAGES.INVALID_DATE_RANGE, 400);
  }
};

const validatePositiveInteger = (value, fieldName) => {
  const num = parseInt(value);
  if (isNaN(num) || num <= 0) {
    throw new AppError(`${fieldName} must be a positive integer`, 400);
  }
  return num;
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateHexColor = (color) => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
};

const validateArrayNotEmpty = (arr, fieldName) => {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new AppError(`${fieldName} must be a non-empty array`, 400);
  }
};

module.exports = {
  validateSessionType,
  validateDateRange,
  validatePositiveInteger,
  validateEmail,
  validateHexColor,
  validateArrayNotEmpty
};