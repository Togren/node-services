// ~~~~~~~~~~~~~~~~~~~~ IMPORTS ~~~~~~~~~~~~~~~~~~~~ //

// NodeJS native

// NPM packages
const _ = require('lodash');
const xml2js = require('xml2js');

// Custom
const InvalidTypeError = require('./errors/InvalidTypeError');
const ParseError = require('./errors/ParseError');

// ~~~~~~~~~~~~~~~~~~~~ SINGLETON ~~~~~~~~~~~~~~~~~~~~ //

const XmlBuilder = (function () {
  // Configuration
  let builder;

  // Private functions
  function init() {
    // Define builder
    return new xml2js.Builder({
      headless: true,
    });
  }

  function get() {
    if (!builder) {
      builder = init();
    }
    return builder;
  }

  // Public functions
  return {
    fromJSON(json) {
      let jsonObj = {};
      // Parse JSON string if necessary
      if (!_.isString(json) && !_.isObject(json)) {
        throw new InvalidTypeError(json, 'string|Object');
      } else if (_.isString(jsonObj)) {
        try {
          jsonObj = JSON.parse(json);
        } catch (parseErr) {
          throw new ParseError('JSON string');
        }
      } else {
        jsonObj = json;
      }
      // Get XML builder
      const builderObj = get();
      return builderObj.buildObject(jsonObj);
    },
  };
}());

module.exports = XmlBuilder;
