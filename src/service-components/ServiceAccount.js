// ~~~~~~~~~~~~~~~~~~~~ IMPORTS ~~~~~~~~~~~~~~~~~~~~ //

// NodeJS native

// NPM packages
const _ = require('lodash');

// Custom
const { ADMIN_ACCOUNTS } = require('../helpers/constants');
const XmlBuilder = require('../XmlBuilder');

// Errors
const InvalidTypeError = require('../errors/InvalidTypeError');
const PropertyRequiredError = require('../errors/PropertyRequiredError');
const ValidationError = require('../errors/ValidationError');

// ~~~~~~~~~~~~~~~~~~~~ CLASS ~~~~~~~~~~~~~~~~~~~~ //

class ServiceAccount {
  constructor(lib) {
    this.allowServiceLogon = lib.allowServiceLogon || null;
    this.username = lib.username || null;
    this.password = lib.password || null;
  }

  get allowServiceLogon() {
    return this._allowServiceLogon;
  }

  set allowServiceLogon(allowServiceLogon) {
    if (!_.isNull(allowServiceLogon)) {
      if (_.isUndefined(allowServiceLogon)) {
        throw new PropertyRequiredError('allowServiceLogon');
      } else if (!_.isBoolean(allowServiceLogon)) {
        throw new InvalidTypeError('allowServiceLogon', typeof allowServiceLogon, 'boolean');
      }
    }
    this._allowServiceLogon = allowServiceLogon;
  }

  get username() {
    return this._username;
  }

  set username(username) {
    if (!_.isNull(username)) {
      if (_.isUndefined(username)) {
        throw new PropertyRequiredError('username');
      } else if (!_.isString(username)) {
        throw new InvalidTypeError('allowServiceLogon', typeof username, 'string');
      } else if (username.length === 0) {
        throw new ValidationError('username should be a non-empty string.');
      }
    }
    this._username = username;
  }

  get password() {
    return this._password;
  }

  set password(password) {
    let pass = password;
    // Ignore password if user is Group Managed Service Account (ending with $).
    // Ignore password if user is LocalSystem, LocalService or NetworkService account.
    if (this.username.charCodeAt(this.username.length - 1) === 36
    || _.includes(ADMIN_ACCOUNTS, this.username)) {
      pass = null;
    }
    // Password validation
    if (!_.isNull(pass)) {
      if (_.isUndefined(pass)) {
        throw new PropertyRequiredError('password');
      } else if (!_.isString(pass)) {
        throw new InvalidTypeError('password', typeof password, 'string');
      } else if (pass.length === 0) {
        throw new ValidationError('password should be a non-empty string.');
      }
    }
    this._password = password;
  }

  toJsonConfig() {
    const jsonConfig = {
      serviceaccount: {},
    };
    // Add allowServiceLogon
    if (this.allowServiceLogon) {
      jsonConfig.serviceaccount.allowservicelogon = this.allowServiceLogon;
    }
    return jsonConfig;
  }

  toXmlString() {
    // Get config as JSON
    const jsonConfig = this.toJsonConfig();
    // Return XML string
    return XmlBuilder.fromJSON(jsonConfig);
  }
}

module.exports = ServiceAccount;
