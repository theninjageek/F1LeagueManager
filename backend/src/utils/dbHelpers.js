const db = require('../config/db');
const { AppError } = require('./errorHandler');

/**
 * Safe query wrapper with error handling
 */
const query = async (sql, params = []) => {
  try {
    const result = await db.query(sql, params);
    return result.rows;
  } catch (err) {
    console.error('Query Error:', err.message);
    throw err; // Let error handler middleware catch it
  }
};

/**
 * Get single row or throw 404
 */
const queryOne = async (sql, params = []) => {
  const rows = await query(sql, params);
  if (rows.length === 0) {
    throw new AppError('Record not found', 404);
  }
  return rows[0];
};

/**
 * Validate resource exists before operating on it
 */
const resourceExists = async (table, id) => {
  const rows = await query(`SELECT id FROM ${table} WHERE id = $1`, [id]);
  if (rows.length === 0) {
    throw new AppError(`${table} with id ${id} not found`, 404);
  }
  return true;
};

/**
 * Update with whitelist validation
 */
const updateWithWhitelist = async (table, id, updates, allowedFields) => {
  const filtered = {};
  const jsonFields = ['points_matrix', 'session_config']; // JSONB fields that need stringification
  
  for (const field of allowedFields) {
    if (field in updates) {
      // Stringify JSONB fields if they're objects
      if (jsonFields.includes(field) && typeof updates[field] === 'object' && updates[field] !== null) {
        filtered[field] = JSON.stringify(updates[field]);
      } else {
        filtered[field] = updates[field];
      }
    }
  }

  if (Object.keys(filtered).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const setClause = Object.keys(filtered)
    .map((key, i) => `${key} = $${i + 1}`)
    .join(', ');

  const values = [...Object.values(filtered), id];
  const sql = `UPDATE ${table} SET ${setClause} WHERE id = $${values.length} RETURNING *`;

  return await queryOne(sql, values);
};

module.exports = { query, queryOne, resourceExists, updateWithWhitelist };