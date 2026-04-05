const express = require('express');
const router = express.Router();
const raceService = require('../services/raceService');

router.post('/finalize', async (req, res) => {
  const { eventId, sessionType, results } = req.body;
  try {
    const outcome = await raceService.finalizeResults(eventId, sessionType, results);
    res.json(outcome);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database update failed" });
  }
});

router.get('/:id/starting-grid', async (req, res) => {
  const eventId = req.params.id;
  const session = req.query.session;

  try {
    const outcome = await raceService.getStartingGrid(eventId, session);
    res.json(outcome);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch grid" });
  }
});

module.exports = router;