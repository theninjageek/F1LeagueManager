const db = require('../config/db');

const finalizeResults = async (eventId, sessionType, results) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch season rules for points
    const seasonQuery = await client.query(
      `SELECT s.points_matrix, s.fl_point_enabled 
       FROM seasons s JOIN events e ON e.season_id = s.id 
       WHERE e.id = $1`, [eventId]
    );
    
    if (!seasonQuery.rows || seasonQuery.rows.length === 0) {
      throw new AppError('Event or season not found', 404);
    }
    const { points_matrix, fl_point_enabled } = seasonQuery.rows[0];
    const sessionKey = sessionType.toLowerCase();

    // Ensure points_matrix is parsed (in case it's a string)
    const matrix = typeof points_matrix === 'string' ? JSON.parse(points_matrix) : points_matrix;

    // Mapping session type to points matrix keys
    let matrixKey = sessionKey;
    if (sessionKey === 'sprint_race') matrixKey = 'sprint';
    else if (sessionKey === 'grand_prix') matrixKey = 'race';

    let pointsArray = matrix[matrixKey];

    // Fallback logic if matrix key isn't found
    if (!pointsArray) {
      if (sessionKey.includes('qualifying')) {
        pointsArray = []; 
      } else {
        pointsArray = matrix['race'] || matrix['grand_prix'] || [];
      }
    }

    // Get fastest lap bonus value (default to 1)
    const fastestLapBonus = matrix.fastest_lap || 1;

    for (const res of results) {
      // 1. Calculate Points
      let points = pointsArray[res.position - 1] || 0;
      const isGP = sessionKey === 'grand_prix';
      if (res.fastest_lap && fl_point_enabled && isGP && !res.is_dnf && res.position <= 10) {
        points += fastestLapBonus;
      }

      // 2. Sanitize Times (Empty strings to NULL)
      const bestLap = (res.best_lap_time === '' || res.best_lap_time === undefined) ? null : res.best_lap_time;
      const totalTime = (res.total_race_time === '' || res.total_race_time === undefined) ? null : res.total_race_time;

      // 3. Upsert Results
      await client.query(
        `INSERT INTO session_results 
        (event_id, driver_id, team_id, session_type, position, grid_position, 
        best_lap_time, total_race_time, is_dnf, fastest_lap, points_awarded)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (event_id, driver_id, session_type) 
        DO UPDATE SET 
          position = EXCLUDED.position,
          grid_position = EXCLUDED.grid_position,
          best_lap_time = EXCLUDED.best_lap_time,
          total_race_time = EXCLUDED.total_race_time,
          is_dnf = EXCLUDED.is_dnf,
          fastest_lap = EXCLUDED.fastest_lap,
          points_awarded = EXCLUDED.points_awarded`,
        [
          eventId, res.driver_id, res.team_id, sessionType, 
          res.position, res.grid_position, bestLap, 
          totalTime, res.is_dnf, res.fastest_lap, points
        ]
      );
    }

    // Mark event finished if it's the Main Race
    if (sessionType === 'GRAND_PRIX') {
      await client.query('UPDATE events SET is_completed = true WHERE id = $1', [eventId]);
    }

    await client.query('COMMIT');
    return { success: true };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const getStartingGrid = async (eventId, sessionType) => {
  // Normalize sessionType to uppercase
  const normalizedSessionType = sessionType.toUpperCase();

  // 1. Check for existing results for this specific session
  const existingResults = await db.pool.query(
    `SELECT 
       d.id, 
       d.name, 
       t.name as team_name, 
       t.color_hex, 
       d.current_team_id as team_id, 
       r.position, 
       r.grid_position, 
       r.is_dnf, 
       r.fastest_lap, 
       r.total_race_time, 
       r.best_lap_time,
       r.points_awarded
     FROM session_results r
     JOIN drivers d ON r.driver_id = d.id
     JOIN teams t ON r.team_id = t.id
     WHERE r.event_id = $1 AND r.session_type = $2
     ORDER BY r.position ASC`,
    [eventId, normalizedSessionType]
  );

  if (existingResults.rows.length > 0) {
    return {
      type: 'EXISTING',
      data: existingResults.rows.map(row => ({
        ...row,
        id: row.id // Ensure id is available
      }))
    };
  }

  // 2. If no existing results, find parent session to use as grid
  let parentSession = null;
  const eventCheck = await db.pool.query(
    'SELECT has_sprint FROM events WHERE id = $1',
    [eventId]
  );
  const hasSprint = eventCheck.rows[0]?.has_sprint;

  // Determine parent session based on current session type
  if (normalizedSessionType === 'GRAND_PRIX') {
    parentSession = hasSprint ? 'SPRINT_RACE' : 'QUALIFYING';
  } else if (normalizedSessionType === 'SPRINT_RACE') {
    parentSession = 'SPRINT_QUALIFYING';
  } else if (normalizedSessionType === 'QUALIFYING') {
    // Qualifying has no parent
    parentSession = null;
  }

  // 3. Try to get parent session results
  if (parentSession) {
    const parentResults = await db.pool.query(
      `SELECT 
         d.id, 
         d.name, 
         t.name as team_name, 
         t.color_hex, 
         d.current_team_id as team_id,
         r.position as grid_position,
         r.is_dnf
       FROM session_results r
       JOIN drivers d ON r.driver_id = d.id
       JOIN teams t ON r.team_id = t.id
       WHERE r.event_id = $1 AND r.session_type = $2 AND r.is_dnf = false
       ORDER BY r.position ASC`,
      [eventId, parentSession]
    );

    if (parentResults.rows.length > 0) {
      return {
        type: 'AUTO_GRID',
        gridSourceSession: parentSession,
        data: parentResults.rows.map((row, idx) => ({
          ...row,
          position: idx + 1, // Starting from P1
          best_lap_time: null,
          total_race_time: null,
          is_dnf: false,
          fastest_lap: false,
          points_awarded: 0
        }))
      };
    }
  }

  // 4. No results found anywhere
  return {
    type: 'EMPTY',
    data: []
  };
};

module.exports = { finalizeResults, getStartingGrid };