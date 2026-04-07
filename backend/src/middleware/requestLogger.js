const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Capture original res.json
  const originalJson = res.json;
  
  res.json = function(data) {
    const duration = Date.now() - startTime;
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      success: data?.success
    });
    
    return originalJson.call(this, data);
  };
  
  next();
};

module.exports = requestLogger;