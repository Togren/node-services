// ~~~~~~~~~~~~~~~~~~~~ IMPORTS ~~~~~~~~~~~~~~~~~~~~ //

// NodeJS native

// NPM packages
const _ = require('lodash');
const xml2js = require('xml2js');

// Custom

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
        throw new TypeError(`To generate XML a string or JSON object is required, received: ${typeof json}`);
      } else if (_.isString(jsonObj)) {
        try {
          jsonObj = JSON.parse(json);
        } catch (parseErr) {
          throw new Error(`Error while parsing json string: ${parseErr}`);
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
