const express = require('express');
const router = express.Router();
const resultService = require('../services/resultService');
const { sendSuccess, sendError } = require('../middleware/responseHandler');
const { validateIntParam } = require('../middleware/validateRequest');
const { AppError } = require('../utils/errorHandler');

// GET /api/results/event/:eventId
router.get('/event/:eventId', validateIntParam('eventId'), async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const sessionType = req.query.type || 'GRAND_PRIX';

    const validSessions = ['QUALIFYING', 'SPRINT_QUALIFYING', 'SPRINT_RACE', 'GRAND_PRIX'];
    if (!validSessions.includes(sessionType)) {
      throw new AppError(`Invalid session type: ${sessionType}`, 400);
    }

    const results = await resultService.getResultsByEvent(eventId, sessionType);
    sendSuccess(res, results);
  } catch (err) {
    next(err);
  }
});

// GET /api/results/sessions/:eventId
router.get('/sessions/:eventId', validateIntParam('eventId'), async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const sessions = await resultService.getAvailableSessions(eventId);
    sendSuccess(res, sessions);
  } catch (err) {
    next(err);
  }
});

module.exports = router;