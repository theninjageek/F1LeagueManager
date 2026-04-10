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

const getCurrentEvent = async (eventId) => {
  const query = `
    SELECT
      e.track_id,
      e.round_number,
      e.weekend_start,
      t.name as track_name,
      t.country_code
    FROM events e
    JOIN tracks t on e.track_id = t.id
    WHERE e.id = $1;
  `;
  const { rows } = await db.query(query, [eventId]);
  return rows;
}

module.exports = { getUpcomingEvents, getCurrentEvent };