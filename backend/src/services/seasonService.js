const db = require('../config/db');

const seasonService = {
  // Create a new season container
  createSeason: async (name, year) => {
    const query = `INSERT INTO seasons (name, year, status) VALUES ($1, $2, 'UPCOMING') RETURNING *;`;
    const { rows } = await db.query(query, [name, year]);
    return rows[0];
  },

  // Assign a track to a specific round in a season
  addEventToSeason: async (seasonId, trackId, roundNumber, isReverse) => {
    const query = `
      INSERT INTO events (season_id, track_id, round_number, is_reverse, is_completed) 
      VALUES ($1, $2, $3, $4, false) 
      RETURNING *;
    `;
    const { rows } = await db.query(query, [seasonId, trackId, roundNumber, isReverse]);
    return rows[0];
  },

  // The "Global Switch" - Deactivates all, then activates one
  setActiveSeason: async (seasonId) => {
    await db.query(`UPDATE seasons SET is_active = false;`);
    const query = `UPDATE seasons SET is_active = true WHERE id = $1 RETURNING *;`;
    const { rows } = await db.query(query, [seasonId]);
    return rows[0];
  }
};

module.exports = seasonService;