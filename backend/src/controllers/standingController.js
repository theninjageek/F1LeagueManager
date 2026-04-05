const standingService = require('../services/standingService');

const getStandings = async (req, res) => {
  try {
    const standings = await standingService.getDriverStandings();
    res.json(standings);
  } catch (err) {
    res.status(500).json({ error: "Failed to load standings" });
  }
};

module.exports = { getStandings };