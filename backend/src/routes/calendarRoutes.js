const express = require('express');
const router = express.Router();
const calendarService = require('../services/calendarService');
const { sendSuccess } = require('../middleware/responseHandler');

router.get('/', async (req, res, next) => {
  try {
    const calendar = await calendarService.getUpcomingEvents();
    sendSuccess(res, calendar);
  } catch (err) {
    next(err);
  }
});

module.exports = router;