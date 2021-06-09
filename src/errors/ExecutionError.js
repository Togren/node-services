
class ExecutionError extends Error {
  // Instantiate new FileNotFoundError
  constructor(cmd, code, msg) {
    // Call Error constructor
    super(`Error during execution of ${cmd} (${code}): ${msg}`);
    // Ensure Error name is equal to class name
    this.name = this.constructor.name;
    // Add stack trace if supported
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ExecutionError);
    }
  }

}

module.exports = ExecutionError;
