const express = require('express');
const router = express.Router();
const standingService = require('../services/standingService');

// DRIVER STANDINGS
router.get('/drivers', async (req, res) => {
  try {
    const standings = await standingService.getDriverStandings();
    res.json(standings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CONSTRUCTOR STANDINGS (Add this now)
router.get('/constructors', async (req, res) => {
  try {
    const standings = await standingService.getConstructorStandings();
    res.json(standings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;