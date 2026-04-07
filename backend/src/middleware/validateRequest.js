// Simple validation utility (you can upgrade to joi/zod later)
const validateRequired = (fields) => {
  return (req, res, next) => {
    const missing = fields.filter(field => !req.body[field]);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missing
      });
    }
    next();
  };
};

const validateIntParam = (paramName) => {
  return (req, res, next) => {
    const id = parseInt(req.params[paramName]);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName}: must be a positive integer`
      });
    }
    req.params[paramName] = id; // Ensure it's an integer
    next();
  };
};

module.exports = { validateRequired, validateIntParam };