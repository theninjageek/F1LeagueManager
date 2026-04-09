const express = require('express');
const router = express.Router();
const driverService = require('../services/driverService');
const { sendSuccess } = require('../middleware/responseHandler');
const { validateRequired, validateIntParam } = require('../middleware/validateRequest');
const { requireAuth } = require('../middleware/authMiddleware');

// GET all drivers - PUBLIC
router.get('/', async (req, res, next) => {
  try {
    const drivers = await driverService.getAllDrivers();
    sendSuccess(res, drivers);
  } catch (err) {
    next(err);
  }
});

// POST create driver - PROTECTED
router.post('/', requireAuth, validateRequired(['name']), async (req, res, next) => {
  try {
    const newDriver = await driverService.createDriver(req.body);
    sendSuccess(res, newDriver, 201, 'Driver created successfully');
  } catch (err) {
    next(err);
  }
});

// PUT transfer driver - PROTECTED
router.put('/:id/transfer', requireAuth, validateIntParam('id'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { teamId } = req.body;
    const updated = await driverService.updateDriverTeam(id, teamId);
    sendSuccess(res, updated, 200, 'Driver transferred successfully');
  } catch (err) {
    next(err);
  }
});

// DELETE driver - PROTECTED
router.delete('/:id', requireAuth, validateIntParam('id'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await driverService.deleteDriver(id);
    sendSuccess(res, deleted, 200, 'Driver contract terminated');
  } catch (err) {
    next(err);
  }
});

module.exports = router;