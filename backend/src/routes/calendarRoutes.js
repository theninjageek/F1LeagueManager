const express = require('express');
const router = express.Router();
const calendarService = require('../services/calendarService');

router.get('/', async (req, res) => {
  try {
    const calendar = await calendarService.getUpcomingEvents();
    res.json(calendar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;