const express = require('express');
const router = express.Router();
const seasonService = require('../services/seasonService');
const { sendSuccess } = require('../middleware/responseHandler');
const { validateRequired, validateIntParam } = require('../middleware/validateRequest');
const { AppError } = require('../utils/errorHandler');
const { requireAuth } = require('../middleware/authMiddleware');

// GET all seasons - PUBLIC
router.get('/', async (req, res, next) => {
  try {
    const seasons = await seasonService.getAllSeasons();
    sendSuccess(res, seasons);
  } catch (err) {
    next(err);
  }
});

// GET season events - PUBLIC
router.get('/:id/events', validateIntParam('id'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const events = await seasonService.getSeasonEvents(id);
    sendSuccess(res, events);
  } catch (err) {
    next(err);
  }
});

// GET active season - PUBLIC
router.get('/active', async (req, res, next) => {
  try {
    const season = await seasonService.getActiveSeason();
    if (!season) {
      throw new AppError('No active season found', 404);
    }
    sendSuccess(res, season);
  } catch (err) {
    next(err);
  }
});

// POST add race/event to season - PROTECTED
router.post('/:id/events', 
  requireAuth,
  validateIntParam('id'),
  validateRequired(['track_id', 'round_number', 'weekend_start', 'weekend_end']),
  async (req, res, next) => {
    try {
      const { id: seasonId } = req.params;
      const { track_id, round_number, weekend_start, weekend_end, has_sprint, is_reverse } = req.body;

      const event = await seasonService.addEventToSeason(seasonId, {
        track_id,
        round_number,
        weekend_start,
        weekend_end,
        has_sprint: has_sprint || false,
        is_reverse: is_reverse || false
      });

      sendSuccess(res, event, 201, 'Event added to season successfully');
    } catch (err) {
      next(err);
    }
  }
);

// POST create season - PROTECTED
router.post('/', requireAuth, validateRequired(['name', 'points_matrix']), async (req, res, next) => {
  try {
    const season = await seasonService.createSeason(req.body);
    sendSuccess(res, season, 201, 'Season created successfully');
  } catch (err) {
    next(err);
  }
});

// PUT update season - PROTECTED
router.put('/:id', requireAuth, validateIntParam('id'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const season = await seasonService.updateSeason(id, req.body);
    sendSuccess(res, season, 200, 'Season updated successfully');
  } catch (err) {
    next(err);
  }
});

// PATCH update event - PROTECTED
router.patch('/events/:eventId', requireAuth, validateIntParam('eventId'), async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await seasonService.updateEvent(eventId, req.body);
    sendSuccess(res, event, 200, 'Event updated successfully');
  } catch (err) {
    next(err);
  }
});

// DELETE event - PROTECTED
router.delete('/events/:eventId', requireAuth, validateIntParam('eventId'), async (req, res, next) => {
  try {
    const { eventId } = req.params;
    await seasonService.deleteEvent(eventId);
    sendSuccess(res, null, 200, 'Event deleted successfully');
  } catch (err) {
    next(err);
  }
});

module.exports = router;