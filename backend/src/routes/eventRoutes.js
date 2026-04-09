const express = require('express');
const router = express.Router();
const raceService = require('../services/raceService');
const { sendSuccess, sendError } = require('../middleware/responseHandler');
const { validateRequired, validateIntParam } = require('../middleware/validateRequest');
const { AppError } = require('../utils/errorHandler');
const { requireAuth } = require('../middleware/authMiddleware');

// POST /api/events/finalize - PROTECTED
router.post('/finalize', requireAuth, validateRequired(['eventId', 'sessionType', 'results']), async (req, res, next) => {
  try {
    const { eventId, sessionType, results } = req.body;

    // Validate sessionType
    const validSessions = ['QUALIFYING', 'SPRINT_QUALIFYING', 'SPRINT_RACE', 'GRAND_PRIX'];
    if (!validSessions.includes(sessionType)) {
      throw new AppError(`Invalid sessionType. Must be one of: ${validSessions.join(', ')}`, 400);
    }

    // Validate results is an array
    if (!Array.isArray(results) || results.length === 0) {
      throw new AppError('results must be a non-empty array', 400);
    }

    const outcome = await raceService.finalizeResults(eventId, sessionType, results);
    sendSuccess(res, outcome, 200, 'Results finalized successfully');
  } catch (err) {
    next(err);
  }
});

// GET /api/events/:id/starting-grid
router.get('/:id/starting-grid', validateIntParam('id'), async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    const sessionType = req.query.session || 'GRAND_PRIX';

    // Validate sessionType
    const validSessions = ['QUALIFYING', 'SPRINT_QUALIFYING', 'SPRINT_RACE', 'GRAND_PRIX'];
    if (!validSessions.includes(sessionType)) {
      throw new AppError(`Invalid session type: ${sessionType}`, 400);
    }

    const grid = await raceService.getStartingGrid(eventId, sessionType);
    sendSuccess(res, grid);
  } catch (err) {
    next(err);
  }
});

module.exports = router;