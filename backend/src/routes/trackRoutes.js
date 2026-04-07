const express = require('express');
const router = express.Router();
const trackService = require('../services/trackService');
const { sendSuccess, sendError } = require('../middleware/responseHandler');

router.get('/', async (req, res, next) => {
  try {
    const tracks = await trackService.getAllTracks();
    sendSuccess(res, tracks);
  } catch (err) {
    next(err);
  }
});

module.exports = router;