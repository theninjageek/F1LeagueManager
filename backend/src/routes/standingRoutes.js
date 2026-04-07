const express = require('express');
const router = express.Router();
const standingService = require('../services/standingService');
const { sendSuccess, sendError } = require('../middleware/responseHandler');

// DRIVER STANDINGS
router.get('/drivers', async (req, res, next) => {
  try {
    const standings = await standingService.getDriverStandings();
    sendSuccess(res, standings);
  } catch (err) {
    next(err);
  }
});

// CONSTRUCTOR STANDINGS
router.get('/constructors', async (req, res, next) => {
  try {
    const standings = await standingService.getConstructorStandings();
    sendSuccess(res, standings);
  } catch (err) {
    next(err);
  }
});

module.exports = router;