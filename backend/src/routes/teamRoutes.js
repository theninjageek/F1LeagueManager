const express = require('express');
const router = express.Router();
const teamService = require('../services/teamService');
const { sendSuccess } = require('../middleware/responseHandler');
const { validateRequired, validateIntParam } = require('../middleware/validateRequest');

// GET all teams
router.get('/', async (req, res, next) => {
  try {
    const teams = await teamService.getAllTeams();
    sendSuccess(res, teams);
  } catch (err) {
    next(err);
  }
});

// POST create team
router.post('/', validateRequired(['name']), async (req, res, next) => {
  try {
    const newTeam = await teamService.createTeam(req.body);
    sendSuccess(res, newTeam, 201, 'Team created successfully');
  } catch (err) {
    next(err);
  }
});

// DELETE team
router.delete('/:id', validateIntParam('id'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await teamService.deleteTeam(id);
    sendSuccess(res, deleted, 200, 'Team removed successfully');
  } catch (err) {
    next(err);
  }
});

module.exports = router;