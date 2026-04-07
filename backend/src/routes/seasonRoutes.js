const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all seasons
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM seasons ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/active', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT name
      FROM seasons 
      WHERE is_active = true 
      LIMIT 1
    `);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ name: "No Active Season" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET events for a season (with Track Name and Country)
router.get('/:id/events', async (req, res) => {
  try {
    const query = `
      SELECT e.*, t.name as track_name, t.location as track_location
      FROM events e
      JOIN tracks t ON e.track_id = t.id
      WHERE e.season_id = $1
      ORDER BY e.round_number ASC;
    `;
    const { rows } = await db.query(query, [req.params.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// POST new season
router.post('/', async (req, res) => {
  const { name, points_matrix } = req.body;
  const defaultPoints = points_matrix || { race: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1], sprint: [8, 7, 6, 5, 4, 3, 2, 1] };
  try {
    const query = `INSERT INTO seasons (name, points_matrix) VALUES ($1, $2) RETURNING *`;
    const { rows } = await db.query(query, [name, JSON.stringify(defaultPoints)]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/events/:eventId', async (req, res) => {
  const { eventId } = req.params;
  const updates = req.body;
  
  // Whitelist allowed fields
  const allowedFields = ['has_sprint', 'is_completed', 'is_reverse', 'has_qualifying', 'has_race', 'points_multiplier'];
  const filteredUpdates = {};
  
  for (const field of allowedFields) {
    if (field in updates) filteredUpdates[field] = updates[field];
  }
  
  if (Object.keys(filteredUpdates).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }
  
  const setClause = Object.keys(filteredUpdates)
    .map((key, i) => `${key} = $${i + 1}`)
    .join(', ');
  
  try {
    const { rows } = await db.query(
      `UPDATE events SET ${setClause} WHERE id = $${Object.keys(filteredUpdates).length + 1} RETURNING *`,
      [...Object.values(filteredUpdates), eventId]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  const { name, points_matrix, is_active } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE seasons SET name = COALESCE($1, name), points_matrix = COALESCE($2, points_matrix), is_active = COALESCE($3, is_active) 
       WHERE id = $4 RETURNING *`,
      [name, points_matrix ? JSON.stringify(points_matrix) : null, is_active, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE Event
router.delete('/events/:eventId', async (req, res) => {
  try {
    await db.query('DELETE FROM events WHERE id = $1', [req.params.eventId]);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;