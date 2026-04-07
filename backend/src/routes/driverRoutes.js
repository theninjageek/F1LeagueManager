const express = require('express');
const router = express.Router();
const driverService = require('../services/driverService');
const { sendSuccess } = require('../middleware/responseHandler');
const { validateRequired, validateIntParam } = require('../middleware/validateRequest');

// GET all drivers
router.get('/', async (req, res, next) => {
  try {
    const drivers = await driverService.getAllDrivers();
    sendSuccess(res, drivers);
  } catch (err) {
    next(err);
  }
});

// POST create driver
router.post('/', validateRequired(['name', 'current_team_id']), async (req, res, next) => {
  try {
    const newDriver = await driverService.createDriver(req.body);
    sendSuccess(res, newDriver, 201, 'Driver created successfully');
  } catch (err) {
    next(err);
  }
});

// PUT transfer driver
router.put('/:id/transfer', validateIntParam('id'), validateRequired(['teamId']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { teamId } = req.body;
    const updated = await driverService.updateDriverTeam(id, teamId);
    sendSuccess(res, updated, 200, 'Driver transferred successfully');
  } catch (err) {
    next(err);
  }
});

// DELETE driver
router.delete('/:id', validateIntParam('id'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await driverService.deleteDriver(id);
    sendSuccess(res, deleted, 200, 'Driver contract terminated');
  } catch (err) {
    next(err);
  }
});

module.exports = router;