
class ServiceExistsError extends Error {
  // Instantiate new FileNotFoundError
  constructor(name) {
    // Call Error constructor
    super(`Service already exists: ${name}.`);
    // Ensure Error name is equal to class name
    this.name = this.constructor.name;
    // Add stack trace if supported
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServiceExistsError);
    }
  }
}

module.exports = ServiceExistsError;
