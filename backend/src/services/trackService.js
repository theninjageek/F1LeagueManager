const { query } = require('../utils/dbHelpers');

const getAllTracks = async () => {
  return await query(`
    SELECT id, name, location, country_code, is_street_circuit 
    FROM tracks 
    ORDER BY name ASC
  `);
};

module.exports = { getAllTracks };