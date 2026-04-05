const express = require('express');
const router = express.Router();
const teamService = require('../services/teamService');

router.get('/', async (req, res) => {
  try {
    const teams = await teamService.getAllTeams();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: "Paddock Error: Failed to retrieve constructors." });
  }
});

router.post('/', async (req, res) => {
  try {
    const newTeam = await teamService.createTeam(req.body);
    res.status(201).json(newTeam);
  } catch (err) {
    res.status(500).json({ error: "Scrutineering Error: Could not register team." });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedTeam = await teamService.deleteTeam(req.params.id);
    res.json({ message: "Constructor removed successfully", team: deletedTeam });
  } catch (err) {
    // Check for PostgreSQL error code 23503 (Foreign Key Violation)
    if (err.code === '23503') {
      return res.status(400).json({ 
        error: "Cannot delete team: Drivers are still assigned to this constructor. Move them to Free Agency first." 
      });
    }
    
    res.status(500).json({ error: err.message || "Failed to delete team." });
  }
});

module.exports = router;