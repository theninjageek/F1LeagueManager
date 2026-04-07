/**
 * Format race weekend date
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date like "24 MAY"
 */
export const formatRaceWeekend = (dateStr) => {
  if (!dateStr) return "TBC";
  
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).toUpperCase();
};

/**
 * Format lap time
 * @param {string} timeStr - Time string
 * @returns {string} Formatted time or '--:--'
 */
export const formatLapTime = (timeStr) => {
  return timeStr || '--:--';
};

/**
 * Get position change indicator
 * @param {number} gridPos - Starting grid position
 * @param {number} finishPos - Finishing position
 * @returns {object} { change: number, label: string }
 */
export const getPositionChange = (gridPos, finishPos) => {
  if (!gridPos) return { change: 0, label: '--' };
  
  const change = gridPos - finishPos;
  
  if (change > 0) return { change, label: `▲${change}`, color: 'text-green-500' };
  if (change < 0) return { change, label: `▼${Math.abs(change)}`, color: 'text-red-500' };
  return { change: 0, label: '--', color: 'text-zinc-600' };
};

/**
 * Get track image path
 * @param {number} trackId - Track ID
 * @returns {string} Path to track image
 */
export const getTrackImagePath = (trackId) => {
  return `/assets/tracks/${trackId}.avif`;
};