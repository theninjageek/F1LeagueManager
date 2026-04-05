const express = require('express');
const router = express.Router();
const driverService = require('../services/driverService');

// GET all drivers
router.get('/', async (req, res) => {
  try {
    const drivers = await driverService.getAllDrivers();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST sign new driver
router.post('/', async (req, res) => {
  try {
    const newDriver = await driverService.createDriver(req.body);
    res.status(201).json(newDriver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT transfer driver to new team
router.put('/:id/transfer', async (req, res) => {
  const { teamId } = req.body;
  try {
    const updated = await driverService.updateDriverTeam(req.params.id, teamId);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE release driver from market
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await driverService.deleteDriver(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Driver not found" });
    res.json({ message: "Contract terminated", driver: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;