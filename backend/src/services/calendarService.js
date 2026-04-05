const db = require('../config/db');

const getUpcomingEvents = async () => {
  const query = `
    SELECT 
      e.id, 
      e.track_id,
      e.round_number, 
      e.is_reverse, 
      e.is_completed,
      e.race_date,
      e.has_sprint,
      e.weekend_start,
      e.weekend_end,
      t.name as track_name, 
      t.country_code,
      t.is_street_circuit
    FROM events e
    JOIN tracks t ON e.track_id = t.id
    ORDER BY e.round_number ASC;
  `;
  const { rows } = await db.query(query);
  return rows;
};

module.exports = { getUpcomingEvents };