const db = require('../config/db');
const { query, queryOne, resourceExists, updateWithWhitelist } = require('../utils/dbHelpers');
const { AppError } = require('../utils/errorHandler');

const getAllSeasons = async () => {
  return await query(`
    SELECT * FROM seasons 
    ORDER BY created_at DESC
  `);
};

const getSeasonEvents = async (seasonId) => {
  await resourceExists('seasons', seasonId);
  
  return await query(`
    SELECT e.*, t.name as track_name, t.location as track_location
    FROM events e
    JOIN tracks t ON e.track_id = t.id
    WHERE e.season_id = $1
    ORDER BY e.round_number ASC
  `, [seasonId]);
};

const getActiveSeason = async () => {
  const result = await query(`
    SELECT * FROM seasons 
    WHERE is_active = true 
    LIMIT 1
  `);
  return result.length > 0 ? result[0] : null;
};

const createSeason = async ({ name, points_matrix }) => {
  if (!name) {
    throw new AppError('Season name is required', 400);
  }

  const defaultPoints = points_matrix || {
    race: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
    sprint: [8, 7, 6, 5, 4, 3, 2, 1]
  };

  return await queryOne(`
    INSERT INTO seasons (name, points_matrix) 
    VALUES ($1, $2) 
    RETURNING *
  `, [name, JSON.stringify(defaultPoints)]);
};

const addEventToSeason = async (seasonId, eventData) => {
  const { track_id, round_number, weekend_start, weekend_end, has_sprint, is_reverse } = eventData;

  // Validate season exists
  await resourceExists('seasons', seasonId);

  // Validate track exists
  await resourceExists('tracks', track_id);

  // Validate round_number is unique for this season
  const existing = await query(
    `SELECT id FROM events WHERE season_id = $1 AND round_number = $2`,
    [seasonId, round_number]
  );
  if (existing.length > 0) {
    throw new AppError(`Round ${round_number} already exists in this season`, 400);
  }

  return await queryOne(`
    INSERT INTO events (
      season_id, 
      track_id, 
      round_number, 
      weekend_start, 
      weekend_end, 
      has_sprint, 
      is_reverse,
      is_completed
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, false) 
    RETURNING *
  `, [seasonId, track_id, round_number, weekend_start, weekend_end, has_sprint, is_reverse]);
};

const updateSeason = async (id, updates) => {
  const allowedFields = ['name', 'points_matrix', 'is_active', 'status', 'fl_point_enabled'];
  return await updateWithWhitelist('seasons', id, updates, allowedFields);
};

const updateEvent = async (eventId, updates) => {
  const allowedFields = ['has_sprint', 'is_completed', 'is_reverse', 'has_qualifying', 'has_race', 'points_multiplier', 'session_config'];
  return await updateWithWhitelist('events', eventId, updates, allowedFields);
};

const deleteEvent = async (eventId) => {
  await resourceExists('events', eventId);
  await query(`DELETE FROM events WHERE id = $1`, [eventId]);
};

const setActiveSeason = async (seasonId) => {
  // Use a transaction to ensure consistency
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`UPDATE seasons SET is_active = false`);
    const result = await client.query(
      `UPDATE seasons SET is_active = true WHERE id = $1 RETURNING *`,
      [seasonId]
    );
    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  getAllSeasons,
  getSeasonEvents,
  getActiveSeason,
  createSeason,
  addEventToSeason,
  updateSeason,
  updateEvent,
  deleteEvent,
  setActiveSeason
};