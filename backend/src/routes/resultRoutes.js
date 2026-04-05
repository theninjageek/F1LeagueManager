const express = require('express');
const router = express.Router();
const resultService = require('../services/resultService');

// GET Results for a specific race
router.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const sessionType = req.query.type || 'GRAND_PRIX'; // Default to GP
    const results = await resultService.getResultsByEvent(eventId, sessionType);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/sessions/:eventId', async (req, res) => {
  try {
    const sessions = await resultService.getAvailableSessions(req.params.eventId);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;