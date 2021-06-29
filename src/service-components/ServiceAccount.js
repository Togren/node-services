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
    this.domain = lib.domain || null;
    this.user = lib.user || null;
    this.password = lib.password || null;
  }

  get domain() {
    return this._domain;
  }

  set domain(domain) {
    if (!_.isNull(domain)) {
      if (_.isUndefined(domain)) {
        throw new PropertyRequiredError('domain');
      } else if (!_.isString(domain)) {
        throw new InvalidTypeError('allowServiceLogon', typeof domain, 'string');
      } else if (domain.length === 0) {
        throw new ValidationError('domain should be a non-empty string.');
      }
    }
    this._domain = domain;
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

  get user() {
    return this.user;
  }

  set user(user) {
    if (!_.isNull(user)) {
      if (_.isUndefined(user)) {
        throw new PropertyRequiredError('user');
      } else if (!_.isString(user)) {
        throw new InvalidTypeError('allowServiceLogon', typeof user, 'string');
      } else if (user.length === 0) {
        throw new ValidationError('user should be a non-empty string.');
      }
    }
    this.user = user;
  }

  get password() {
    return this._password;
  }

  set password(password) {
    let pass = password;
    // Ignore password if user is Group Managed Service Account (ending with $).
    // Ignore password if user is LocalSystem, LocalService or NetworkService account.
    if (this.user.charCodeAt(this.user.length - 1) === 36
    || _.includes(ADMIN_ACCOUNTS, this.user)) {
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
    // Add domain
    if (this.domain) {
      jsonConfig.serviceaccount.domain = this.domain;
    }
    // Add username
    if (this.user) {
      jsonConfig.serviceaccount.user = this.user;
    }
    // Add password
    if (this.password) {
      jsonConfig.serviceaccount.password = this.password;
    }
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
