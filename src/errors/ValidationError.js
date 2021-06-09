
class ValidationError extends Error {
  // Instantiate new FileNotFoundError
  constructor(msg) {
    // Call Error constructor
    super(`Validation error: ${msg}`);
    // Ensure Error name is equal to class name
    this.name = this.constructor.name;
    // Add stack trace if supported
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

module.exports = ValidationError;
