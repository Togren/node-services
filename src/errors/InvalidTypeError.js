
class InvalidTypeError extends Error {
  // Instantiate new FileNotFoundError
  constructor(name, type, required) {
    // Call Error constructor
    super(`Invalid type: ${type}, required is ${required}`);
    // Ensure Error name is equal to class name
    this.name = this.constructor.name;
    // Add stack trace if supported
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidTypeError);
    }
  }
}

module.exports = InvalidTypeError;
