// ~~~~~~~~~~~~~~~~~~~~ IMPORTS ~~~~~~~~~~~~~~~~~~~~ //

// NodeJS native

// NPM packages
const _ = require('lodash');

// Custom
const { execSync } = require('./exec');

// Errors
const ValidationError = require('../errors/ValidationError');

// ~~~~~~~~~~~~~~~~~~~~ USER ~~~~~~~~~~~~~~~~~~~~ //

function isValidUsername(userName) {
  let isValid = false;
  if (!_.isUndefined(userName) && !_.isNull(userName)
    && _.isString(userName) && userName.length > 0) {
    isValid = true;
  }
  return isValid;
}

function isUser(userName) {
  let exists = false;
  if (!isValidUsername(userName)) {
    throw new ValidationError(`Invalid username: ${userName}.`);
  }
  // Validate if user exists
  try {
    execSync(`net user ${userName}`, { silent: true });
    exists = true;
  } catch (execErr) {
    // Do nothing, user does not exist
  }
  return exists;
}

function getUserSID(userName) {
  // Validate username
  if (!isValidUsername(userName)) {
    throw new ValidationError(`Invalid username: ${userName}.`);
  } else if (!isUser(userName)) {
    throw new ValidationError(`Non-existing username: ${userName}.`);
  }
  // Retrieve user SID
  const execResult = execSync(`wmic useraccount where name='${userName}' get sid | find /v "SID"`, { silent: true });
  return _.trim(execResult);
}

// ~~~~~~~~~~~~~~~~~~~~ SERVICES ~~~~~~~~~~~~~~~~~~~~ //

function isService(id) {
  let exists = false;
  // Check if service is present
  if (!_.isNull(id) && !_.isUndefined(id) && _.isString(id) && id.length > 0) {
    try {
      execSync(`sc query ${id}`);
      exists = true;
    } catch (validationErr) {
      // Do nothing, service does not exist
    }
  }
  return exists;
}

function isValidServiceID(id) {
  let isValid = false;
  if (!_.isUndefined(id) && !_.isNull(id)
    && _.isString(id) && id.length > 0 && isService(id)) {
    isValid = true;
  }
  return isValid;
}

function isValidSDDL(sddl) {
  let isValid = false;
  const sddlRegex = new RegExp('(D:.+?)(S:.+|$)');
  if (!_.isUndefined(sddl) && !_.isNull(sddl)
    && _.isString(sddl) && sddl.length > 0 && sddl.match(sddlRegex)) {
    isValid = true;
  }
  return isValid;
}

function getSDDL(id) {
  if (!isValidServiceID(id)) {
    throw new ValidationError(`Invalid service ID: ${id}.`);
  }
  // Retrieve the service SDDL
  const SDDL = _.trim(execSync(`sc sdshow ${id}`, { silent: true }));
  // Split the SDDL if applicable into DACL and SADL
  const sddlRegex = new RegExp('(D:.+?)(S:.+|$)');
  const regexMatch = SDDL.match(sddlRegex);
  // Validate if match occurred
  if (!regexMatch) {
    throw new ValidationError(`Invalid SDDL format: ${SDDL}.`);
  }
  // Create return object
  const returnObj = {
    DACL: regexMatch[1],
  };
  if (regexMatch.length > 2) {
    returnObj.SADL = regexMatch[2];
  }
  return returnObj;
}

function setSDDL(id, sddl) {
  // Validate input parameters
  if (!isValidServiceID(id)) {
    throw new ValidationError(`Invalid service ID: ${id}.`);
  } else if (!isValidSDDL(sddl)) {
    throw new ValidationError(`Invalid SDDL: ${sddl}.`);
  }
  // Set new SDDL
  execSync(`sc sdset ${id} "${sddl}"`, { silent: true });
}

function sddlHasUserID(id, userName) {
  // Validate service ID
  if (!isValidServiceID(id)) {
    throw new ValidationError(`Invalid service ID: ${id}.`);
  } else if (!isUser(userName)) {
    // Validate username
    throw new ValidationError(`Non-existing username: ${userName}.`);
  }
  // Retrieve service SDDL
  const sddl = getSDDL(id);
  // Retrieve user SID
  const userSID = getUserSID(userName);
  // Add user to DACL
  const sddlHasUser = sddl.DACL.match(new RegExp(userSID));
  return !!sddlHasUser;
}

function addUserToSDDL(id, userName) {
  // Validate service ID
  if (!isValidServiceID(id)) {
    throw new ValidationError(`Invalid service ID: ${id}.`);
  } else if (!isUser(userName)) {
    // Validate username
    throw new ValidationError(`Non-existing username: ${userName}.`);
  }
  // Retrieve service SDDL
  const sddl = getSDDL(id);
  // Retrieve user SID
  const userSID = getUserSID(userName);
  // Add user to DACL
  const newDACL = `${sddl.DACL}(A;;LCDTRPWPCR;;;${userSID})`;
  // Set new SDDL
  setSDDL(id, `${newDACL}${sddl.SADL ? sddl.SADL : ''}`);
}

module.exports = {
  getSDDL,
  setSDDL,
  getUserSID,
  sddlHasUserID,
  isService,
  addUserToSDDL,
};
