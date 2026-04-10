const express = require('express');
const router = express.Router();
const calendarService = require('../services/calendarService');
const { sendSuccess } = require('../middleware/responseHandler');
const e = require('express');

router.get('/', async (req, res, next) => {
  try {
    const event_id = req.query.event_id || '';

    if (event_id) {
      const calendar = await calendarService.getCurrentEvent(event_id);
      sendSuccess(res, calendar);
    } else {
    const calendar = await calendarService.getUpcomingEvents();
    sendSuccess(res, calendar);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;