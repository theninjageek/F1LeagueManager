const express = require('express');
const cors = require('cors');
const standingRoutes = require('./routes/standingRoutes');
const driverRoutes = require('./routes/driverRoutes');
const eventRoutes = require('./routes/eventRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const seasonRoutes = require('./routes/seasonRoutes');
const trackRoutes = require('./routes/trackRoutes');
const teamRoutes = require('./routes/teamRoutes');
const resultRoutes = require('./routes/resultRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/standings', standingRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/seasons', seasonRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/results', resultRoutes);

app.use((err, req, res, next) => {
  console.error("!!! BACKEND CRASH !!!");
  console.error(err.stack); // This prints the exact line number in your terminal
  res.status(500).json({ 
    error: "Internal Server Error", 
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {} 
  });
});

module.exports = app;