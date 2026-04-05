const db = require('../config/db');

const getDriverStandings = async () => {
  const query = `
    SELECT 
      d.name, 
      t.name as team_name, 
      t.color_hex, 
      COALESCE(SUM(sr.points_awarded), 0) as total_points,
      -- Count P1 finishes in Grand Prix sessions for tie-breaking
      COUNT(CASE WHEN sr.position = 1 AND sr.session_type = 'GRAND_PRIX' THEN 1 END) as wins
    FROM drivers d
    JOIN teams t ON d.current_team_id = t.id
    LEFT JOIN session_results sr ON d.id = sr.driver_id
    GROUP BY d.id, t.id, t.name, t.color_hex
    -- Sort by points first, then by wins as a tie-breaker
    ORDER BY total_points DESC, wins DESC, d.name ASC;
  `;
  const { rows } = await db.query(query);
  return rows;
};

const getConstructorStandings = async () => {
  const query = `
    SELECT 
      t.name, 
      t.color_hex, 
      COALESCE(SUM(sr.points_awarded), 0) as total_points,
      COUNT(CASE WHEN sr.position = 1 AND sr.session_type = 'GRAND_PRIX' THEN 1 END) as wins
    FROM teams t
    LEFT JOIN session_results sr ON t.id = sr.team_id
    GROUP BY t.id, t.name, t.color_hex
    ORDER BY total_points DESC, wins DESC, t.name ASC;
  `;
  const { rows } = await db.query(query);
  return rows;
};

module.exports = { 
  getDriverStandings, 
  getConstructorStandings
};