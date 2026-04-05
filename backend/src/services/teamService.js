const db = require('../config/db');

const getAllTeams = async () => {
  // Sort by name so the grid stays organized
  const query = 'SELECT * FROM teams ORDER BY name ASC;';
  const { rows } = await db.query(query);
  return rows;
};

const createTeam = async (teamData) => {
  const { name, color_hex, team_icon_url } = teamData;
  const query = `
    INSERT INTO teams (name, color_hex, team_icon_url) 
    VALUES ($1, $2, $3) 
    RETURNING *;
  `;
  const { rows } = await db.query(query, [name, color_hex, team_icon_url]);
  return rows[0];
};

const deleteTeam = async (id) => {
  // Option A: Prevent deletion if drivers are assigned (Safe)
  // This will throw an error if a Foreign Key constraint is violated, 
  // which we catch in the controller/router.
  const query = 'DELETE FROM teams WHERE id = $1 RETURNING *;';
  const { rows } = await db.query(query, [id]);
  
  if (rows.length === 0) {
    throw new Error('Team not found');
  }
  
  return rows[0];
};

module.exports = {
  getAllTeams,
  createTeam,
  deleteTeam
};