const { query, queryOne, resourceExists } = require('../utils/dbHelpers');
const { AppError } = require('../utils/errorHandler');

const getAllDrivers = async () => {
  return await query(`
    SELECT d.id, d.name, d.race_number, d.is_ai, d.country_code, 
           t.id as team_id, t.name as team_name, t.color_hex 
    FROM drivers d
    LEFT JOIN teams t ON d.current_team_id = t.id
    ORDER BY d.name ASC
  `);
};

const createDriver = async ({ name, race_number, current_team_id, is_ai, country_code }) => {
  // Validate team exists
  await resourceExists('teams', current_team_id);

  // Check if driver with same race number exists
  const existing = await query(
    `SELECT id FROM drivers WHERE race_number = $1`,
    [race_number]
  );
  if (existing.length > 0) {
    throw new AppError(`Driver with race number ${race_number} already exists`, 400);
  }

  return await queryOne(`
    INSERT INTO drivers (name, race_number, current_team_id, is_ai, country_code)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [name, race_number, current_team_id, is_ai || false, country_code?.toUpperCase()]);
};

const updateDriverTeam = async (driverId, newTeamId) => {
  await resourceExists('drivers', driverId);
  await resourceExists('teams', newTeamId);

  return await queryOne(
    `UPDATE drivers SET current_team_id = $2 WHERE id = $1 RETURNING *`,
    [driverId, newTeamId]
  );
};

const deleteDriver = async (id) => {
  return await queryOne(`DELETE FROM drivers WHERE id = $1 RETURNING *`, [id]);
};

module.exports = { getAllDrivers, createDriver, updateDriverTeam, deleteDriver };