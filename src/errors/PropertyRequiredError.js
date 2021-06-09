
class PropertyRequiredError extends Error {
  // Instantiate new FileNotFoundError
  constructor(property, parent = null) {
    // Call Error constructor
    super(`Property ${property} is required ${parent ? `on/in ${parent}` : ''}`);
    // Ensure Error name is equal to class name
    this.name = this.constructor.name;
    // Add stack trace if supported
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PropertyRequiredError);
    }
  }
}

module.exports = PropertyRequiredError;
