// ~~~~~~~~~~~~~~~~~~~~ IMPORTS ~~~~~~~~~~~~~~~~~~~~ //

// NodeJS native
const path = require('path');

// NPM packages
const _ = require('lodash');

// Custom
const XmlBuilder = require('../XmlBuilder');

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
        throw new TypeError('Allow service logon should be defined and of type boolean.');
      } else if (!_.isBoolean(allowServiceLogon)) {
        throw new TypeError(`Allow service logon should be of type boolean, received ${typeof allowServiceLogon}`);
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
        throw new TypeError('Username should be defined and of type string.');
      } else if (!_.isString(username)) {
        throw new TypeError(`Username should be of type string, received ${typeof username}`);
      } else if (username.length === 0) {
        throw new RangeError('Username should not be an empty string.');
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
    || _.includes([
      'LocalSystem',
      'NT AUTHORITY\\LocalService',
      'NT AUTHORITY\\NetworkService',
    ], this.username)) {
      pass = null;
    }
    // Password validation
    if (!_.isNull(pass)) {
      if (_.isUndefined(pass)) {
        throw new TypeError('Password for user should be defined and of type string.');
      } else if (!_.isString(pass)) {
        throw new TypeError(`Password for user should be of type string, received ${typeof pass}.`);
      } else if (pass.length === 0) {
        throw new RangeError('Password for user should not be an empty string.');
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
