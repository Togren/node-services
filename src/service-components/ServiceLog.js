// ~~~~~~~~~~~~~~~~~~~~ IMPORTS ~~~~~~~~~~~~~~~~~~~~ //

// NodeJS native
const path = require('path');

// NPM packages
const _ = require('lodash');
const shell = require('shelljs');

// Custom
const { LOG_MODES } = require('../helpers/constants');
const XmlBuilder = require('../XmlBuilder');

// Errors
const EnumValidationError = require('../errors/EnumValidationError');
const InvalidTypeError = require('../errors/InvalidTypeError');
const PropertyRequiredError = require('../errors/PropertyRequiredError');
const ValidationError = require('../errors/ValidationError');

// ~~~~~~~~~~~~~~~~~~~~ CLASS ~~~~~~~~~~~~~~~~~~~~ //

class ServiceLog {
  constructor(lib) {
    this.logpath = lib.logpath || null;
    this.mode = lib.mode || null;
    this.sizeThreshold = lib.sizeThreshold || null;
    this.keepFiles = lib.keepFiles || null;
    this.pattern = lib.pattern || null;
    this.autoRollAtTime = lib.autoRollAtTime || null;

    // Validation on required fields
    if (_.includes([LOG_MODES.ROLL_BY_TIME, LOG_MODES.ROLL_BY_SIZE_TIME], this.mode)
    && !this.pattern) {
      throw new ValidationError('Log mode roll-by(-size)-time requires a date pattern supplied.');
    }
  }

  get logpath() {
    return this._logpath;
  }

  set logpath(logPath) {
    let logDir = logPath;
    if (!_.isNull(logDir)) {
      if (_.isUndefined(logDir)) {
        throw new PropertyRequiredError('logPath');
      } else if (!_.isString(logDir)) {
        throw new InvalidTypeError('logDir', typeof logDir, 'string');
      } else if (logDir.length === 0) {
        throw new ValidationError('logPath should be a non-empty string.');
      }
      // Create absolute path if not already
      if (!path.isAbsolute(logDir)) {
        logDir = path.resolve(process.cwd(), logDir);
      }
      // Create directory if necessary
      if (!shell.test('-ed', logDir)) {
        shell.mkdir('-p', logDir);
      }
    }
    this._logpath = logDir;
  }

  get mode() {
    return this._mode;
  }

  set mode(mode) {
    if (!_.isNull(mode)) {
      if (_.isUndefined(mode)) {
        throw new PropertyRequiredError('mode');
      } else if (!_.isString(mode)) {
        throw new InvalidTypeError('mode', typeof mode, 'string');
      } else if (mode.length === 0) {
        throw new ValidationError('mode should be a non-empty string.');
      } else if (!_.includes(_.values(LOG_MODES), mode)) {
        throw new EnumValidationError(`mode is non-supported value ${mode}`);
      }
    }
    this._mode = mode;
  }

  get sizeThreshold() {
    return this._sizeThreshold;
  }

  set sizeThreshold(sizeThreshold) {
    if (!_.isNull(sizeThreshold)) {
      if (_.isUndefined(sizeThreshold)) {
        throw new PropertyRequiredError('sizeThreshold');
      } else if (!_.isNumber(sizeThreshold)) {
        throw new InvalidTypeError('sizeThreshold', typeof sizeThreshold, 'number');
      } else if (!_.isInteger(sizeThreshold)) {
        throw new InvalidTypeError('sizeThreshold', sizeThreshold, 'integer');
      } else if (parseInt(sizeThreshold, 10) <= 0) {
        throw new InvalidTypeError('sizeThreshold', sizeThreshold, 'positive integer');
      }
    }
    this._sizeThreshold = sizeThreshold;
  }

  get keepFiles() {
    return this._keepFiles;
  }

  set keepFiles(keepFiles) {
    if (!_.isNull(keepFiles)) {
      if (_.isUndefined(keepFiles)) {
        throw new PropertyRequiredError('keepFiles');
      } else if (!_.isNumber(keepFiles)) {
        throw new InvalidTypeError('keepFiles', typeof keepFiles, 'number');
      } else if (!_.isInteger(keepFiles)) {
        throw new InvalidTypeError('keepFiles', keepFiles, 'integer');
      } else if (parseInt(keepFiles, 10) <= 0) {
        throw new InvalidTypeError('keepFiles', keepFiles, 'positive integer');
      }
    }
    this._keepFiles = keepFiles;
  }

  get pattern() {
    return this._pattern;
  }

  set pattern(pattern) {
    if (!_.isNull(pattern)) {
      if (_.isUndefined(pattern)) {
        throw new PropertyRequiredError('pattern');
      } else if (!_.isString(pattern)) {
        throw new InvalidTypeError('pattern', typeof pattern, 'string');
      } else if (pattern.length === 0) {
        throw new ValidationError('pattern should be a non-empty string.');
      }
      // TODO: Write validation for date pattern
    }
    this._pattern = pattern;
  }

  get autoRollAtTime() {
    return this._autoRollAtTime;
  }

  set autoRollAtTime(autoRollAtTime) {
    if (!_.isNull(autoRollAtTime)) {
      if (_.isUndefined(autoRollAtTime)) {
        throw new PropertyRequiredError('autoRollAtTime');
      } else if (!_.isString(autoRollAtTime)) {
        throw new InvalidTypeError('autoRollAtTime', typeof autoRollAtTime, 'string');
      } else if (autoRollAtTime.length === 0) {
        throw new ValidationError('autoRollAtTime should be a non-empty string.');
      }
      // TODO: Write validation for time pattern
    }
    this._autoRollAtTime = autoRollAtTime;
  }

  toJsonConfig() {
    const jsonConfig = {};
    // Add log path
    if (this.logpath) {
      jsonConfig.logpath = this.logpath;
    }
    // Add mode
    if (this.mode) {
      jsonConfig.log = {
        $: {
          mode: this.mode,
        },
      };
    }
    // Add file size threshold
    if (_.includes([LOG_MODES.ROLL_BY_SIZE, LOG_MODES.ROLL_BY_SIZE_TIME], this.mode)
        && this.sizeThreshold) {
      jsonConfig.log.sizeThreshold = this.sizeThreshold;
    }
    // Add amount of files to maintain
    if (LOG_MODES.ROLL_BY_SIZE === this.mode && this.keepFiles) {
      jsonConfig.log.keepFiles = this.keepFiles;
    }
    // Add automatic roll on timestamp
    if (LOG_MODES.ROLL_BY_SIZE_TIME === this.mode && this.autoRollAtTime) {
      jsonConfig.log.autoRollAtTime = this.autoRollAtTime;
    }
    // Add date pattern for log file
    if (_.includes([LOG_MODES.ROLL_BY_TIME, LOG_MODES.ROLL_BY_SIZE_TIME], this.mode)
        && this.pattern) {
      jsonConfig.log.pattern = this.pattern;
    }
    return jsonConfig;
  }

  toXmlString() {
    // Get config as JSON
    const jsonConfig = this.toJsonConfig();
    // return XML string
    return XmlBuilder.fromJSON(jsonConfig);
  }
}

module.exports = ServiceLog;
