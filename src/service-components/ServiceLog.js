// ~~~~~~~~~~~~~~~~~~~~ IMPORTS ~~~~~~~~~~~~~~~~~~~~ //

// NodeJS native
const path = require('path');

// NPM packages
const _ = require('lodash');
const shell = require('shelljs');

// Custom
const { LOG_MODES } = require('../helpers/constants');
const XmlBuilder = require('../XmlBuilder');

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
    if (_.includes([LOG_MODES.ROLL_BY_TIME, LOG_MODES.ROLL_BY_SIZE_TIME], this.pattern)) {
      throw new RangeError('Log mode roll-by(-size)-time requires a date pattern supplied.');
    }
  }

  get logpath() {
    return this._logpath;
  }

  set logpath(logPath) {
    let logDir = logPath;
    if (!_.isNull(logDir)) {
      if (_.isUndefined(logDir)) {
        throw new TypeError('Log path should be defined and of type string.');
      } else if (!_.isString(logDir)) {
        throw new TypeError(`Log path should be of type string, received ${typeof logDir}.`);
      } else if (logDir.length === 0) {
        throw new RangeError('Log path should not be an empty string.');
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
        throw new TypeError('Log mode should be defined and of type string.');
      } else if (!_.isString(mode)) {
        throw new TypeError(`Log mode should be of type string, received ${typeof mode}.`);
      } else if (mode.length === 0) {
        throw new RangeError('Log mode should not be an empty string.');
      } else if (!_.includes(_.values(LOG_MODES), mode)) {
        throw new RangeError(`Provided log mode ${mode} not supported. Choose one of the following:
          ${LOG_MODES}.`);
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
        throw new TypeError('Log size threshold should be defined and of type number.');
      } else if (!_.isNumber(sizeThreshold)) {
        throw new TypeError(`Log size threshold should be of type number, received ${typeof sizeThreshold}.`);
      } else if (!_.isInteger(sizeThreshold)) {
        throw new TypeError(`Log size threshold should be an integer, received ${sizeThreshold}.`);
      } else if (parseInt(sizeThreshold, 10) <= 0) {
        throw new RangeError(`Log size threshold should be larger than 0, received ${sizeThreshold}`);
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
        throw new TypeError('Amount of rolled files should be defined and of type number.');
      } else if (!_.isNumber(keepFiles)) {
        throw new TypeError(`Amount of rolled files should be of type number, received ${typeof keepFiles}.`);
      } else if (!_.isInteger(keepFiles)) {
        throw new TypeError(`Amount of rolled files should be an integer, received ${keepFiles}.`);
      } else if (parseInt(keepFiles, 10) <= 0) {
        throw new RangeError(`Amount of rolled files should be larger than 0, received ${keepFiles}`);
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
        throw new TypeError('Log file date pattern should be defined and of type string.');
      } else if (!_.isString(pattern)) {
        throw new TypeError(`Log file date pattern should be of type string, received ${typeof pattern}.`);
      } else if (pattern.length === 0) {
        throw new TypeError('Log file date pattern should not be an empty string.');
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
        throw new TypeError('Log file roll time should be defined and of type string.');
      } else if (!_.isString(autoRollAtTime)) {
        throw new TypeError(`Log file roll time should be of type string, received ${typeof autoRollAtTime}.`);
      } else if (autoRollAtTime.length === 0) {
        throw new TypeError('Log file roll time should not be an empty string.');
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
