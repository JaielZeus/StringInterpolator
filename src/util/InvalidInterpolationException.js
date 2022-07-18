/**
 * Custom Error subclass for handling errors while interpolating. Adds a fallback replacement string for handling errors in the upper recursion loop
 */
class InvalidInterpolationException extends Error {
  /**
   * Constructor adds a custom name and a fallback replacement variable for handling errors that occur while interpolating
   * @param {string} message the message of the error
   * @param {string} replacement the fallback replacement if an error occured, used in the upper recursion loop
   */
  constructor(message, replacement) {
    super(message);
    this.name = 'InvalidInterpolationException';
    this.replacement = replacement;
  }
}

module.exports = InvalidInterpolationException;
