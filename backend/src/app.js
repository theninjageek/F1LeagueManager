const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // Add logging
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const { limiter, strictLimiter } = require('./middleware/rateLimiter');

// Routes
const standingRoutes = require('./routes/standingRoutes');
const driverRoutes = require('./routes/driverRoutes');
const eventRoutes = require('./routes/eventRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const seasonRoutes = require('./routes/seasonRoutes');
const trackRoutes = require('./routes/trackRoutes');
const teamRoutes = require('./routes/teamRoutes');
const resultRoutes = require('./routes/resultRoutes');

const app = express();

// Middleware - Order matters!
app.use(morgan('dev')); // Logging
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use(requestLogger);

app.use('/api/events/finalize', strictLimiter);
app.use('/api/seasons', strictLimiter);
app.use('/api/teams', strictLimiter);
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes (v1 prefix is optional but recommended)
app.use('/api/standings', standingRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/seasons', seasonRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/results', resultRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Centralized error handler (MUST be last)
app.use(errorHandler);

module.exports = app;