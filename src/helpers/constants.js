// ~~~~~~~~~~~~~~~~~~~~ LOG MODES ~~~~~~~~~~~~~~~~~~~~ //

const LOG_MODES = {
  APPEND: 'append',
  RESET: 'reset',
  NONE: 'none',
  ROLL_BY_SIZE: 'roll-by-size',
  ROLL_BY_TIME: 'roll-by-time',
  ROLL_BY_SIZE_TIME: 'roll-by-size-time',
};

exports.LOG_MODES = LOG_MODES;

// ~~~~~~~~~~~~~~~~~~~~ ADMIN ACCOUNTS ~~~~~~~~~~~~~~~~~~~~ //

const ADMIN_ACCOUNTS = [
  'LocalSystem',
  'NT AUTHORITY\\LocalService',
  'NT AUTHORITY\\NetworkService',
];

exports.ADMIN_ACCOUNTS = ADMIN_ACCOUNTS;
