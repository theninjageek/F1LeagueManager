const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all tracks for the Season Manager dropdown
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM tracks ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;