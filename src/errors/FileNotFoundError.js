
class FileNotFoundError extends Error {
  // Instantiate new FileNotFoundError
  constructor(filePath) {
    // Call Error constructor
    super(`File not found: ${filePath}`);
    // Ensure Error name is equal to class name
    this.name = this.constructor.name;
    // Add stack trace if supported
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FileNotFoundError);
    }
  }
}

module.exports = FileNotFoundError;
