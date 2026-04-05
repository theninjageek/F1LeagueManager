const db = require('../config/db');

const getAllDrivers = async () => {
  const query = `
    SELECT d.id, d.name, d.race_number, d.is_ai, d.country_code, 
           t.id as team_id, t.name as team_name, t.color_hex 
    FROM drivers d
    LEFT JOIN teams t ON d.current_team_id = t.id
    ORDER BY d.name ASC;
  `;
  const { rows } = await db.query(query);
  return rows;
};

const createDriver = async (driverData) => {
  const { name, race_number, current_team_id, is_ai, country_code } = driverData;
  const query = `
    INSERT INTO drivers (name, race_number, current_team_id, is_ai, country_code)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [
    name, 
    race_number, 
    current_team_id, 
    is_ai || false, 
    country_code?.toUpperCase()
  ]);
  return rows[0];
};

const updateDriverTeam = async (driverId, newTeamId) => {
  const query = `
    UPDATE drivers 
    SET current_team_id = $2 
    WHERE id = $1 
    RETURNING *;
  `;
  const { rows } = await db.query(query, [driverId, newTeamId]);
  return rows[0];
};

const deleteDriver = async (id) => {
  const query = 'DELETE FROM drivers WHERE id = $1 RETURNING *;';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

module.exports = { 
  getAllDrivers,
  createDriver,
  updateDriverTeam,
  deleteDriver
};