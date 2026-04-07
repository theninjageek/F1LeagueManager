const SESSION_TYPES = {
  QUALIFYING: 'QUALIFYING',
  SPRINT_QUALIFYING: 'SPRINT_QUALIFYING',
  SPRINT_RACE: 'SPRINT_RACE',
  GRAND_PRIX: 'GRAND_PRIX'
};

const SEASON_STATUS = {
  UPCOMING: 'UPCOMING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED'
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500
};

const ERROR_MESSAGES = {
  SEASON_NOT_FOUND: 'Season not found',
  EVENT_NOT_FOUND: 'Event not found',
  DRIVER_NOT_FOUND: 'Driver not found',
  TEAM_NOT_FOUND: 'Team not found',
  TRACK_NOT_FOUND: 'Track not found',
  INVALID_SESSION_TYPE: 'Invalid session type',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  DUPLICATE_ROUND: 'Round already exists in this season',
  INVALID_DATE_RANGE: 'weekend_start must be before weekend_end',
  FOREIGN_KEY_VIOLATION: 'Cannot delete: referenced by other records',
  DUPLICATE_ENTRY: 'Record already exists'
};

module.exports = {
  SESSION_TYPES,
  SEASON_STATUS,
  HTTP_STATUS,
  ERROR_MESSAGES
};