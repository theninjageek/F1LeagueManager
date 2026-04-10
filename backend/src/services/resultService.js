const db = require('../config/db');

// New: Helper to find which sessions exist
const getAvailableSessions = async (eventId) => {
  const query = `
    SELECT session_type FROM session_results 
    WHERE event_id = $1 
    GROUP BY session_type
  `;
  const { rows } = await db.query(query, [eventId]);
  return rows.map(r => r.session_type);
};

const getResultsByEvent = async (eventId, sessionType = 'GRAND_PRIX') => {
  const query = `
    WITH event_sessions AS (
      SELECT session_type FROM session_results WHERE event_id = $1 GROUP BY session_type
    ),
    grid_logic AS (
      SELECT CASE 
        -- GP Grid: Priority 1: Sprint Results, Priority 2: Quali Results
        WHEN $2 = 'GRAND_PRIX' THEN (
          CASE WHEN 'SPRINT_RACE' = ANY(SELECT session_type FROM event_sessions) THEN 'SPRINT_RACE'
               ELSE 'QUALIFYING' END
        )
        -- Sprint Grid: Priority 1: Sprint Quali, Priority 2: Quali
        WHEN $2 = 'SPRINT_RACE' THEN (
          CASE WHEN 'SPRINT_QUALIFYING' = ANY(SELECT session_type FROM event_sessions) THEN 'SPRINT_QUALIFYING'
               ELSE 'QUALIFYING' END
        )
        ELSE NULL
      END as source_type
    )
    SELECT 
      sr.*, d.name as driver_name, t.name as team_name, t.color_hex,
      -- Use manual grid if set, otherwise pull from the source_type session
      COALESCE(sr.grid_position, (
        SELECT prev.position FROM session_results prev 
        WHERE prev.event_id = $1 AND prev.driver_id = sr.driver_id 
        AND prev.session_type = (SELECT source_type FROM grid_logic)
      )) as calculated_grid
    FROM session_results sr
    JOIN drivers d ON sr.driver_id = d.id
    JOIN teams t ON sr.team_id = t.id
    WHERE sr.event_id = $1 AND sr.session_type = $2
    ORDER BY CASE WHEN sr.is_dnf THEN 1 ELSE 0 END, sr.position ASC;
  `;
  
  const { rows } = await db.query(query, [eventId, sessionType]);
  return rows;
};

module.exports = { getResultsByEvent, getAvailableSessions };