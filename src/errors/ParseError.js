
class ParseError extends Error {
  // Instantiate new FileNotFoundError
  constructor(file) {
    // Call Error constructor
    super(`Error during parsing of string/file ${file}`);
    // Ensure Error name is equal to class name
    this.name = this.constructor.name;
    // Add stack trace if supported
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ParseError);
    }
  }

}

module.exports = ParseError;
