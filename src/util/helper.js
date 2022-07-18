const { ESCAPE } = require('./constants');

/**
 * Checks if a given value is a boolean
 * @param {any} value the value to check
 * @returns true if the value is a boolean, false otherwise
 */
function isBoolean(value) {
  return typeof value === 'boolean';
}

/**
 * Checks if a given value is a number
 * @param {any} value the value to check
 * @returns true if the value is a number, false otherwise
 */
function isNumber(value) {
  return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Checks if a given value is a string
 * @param {any} value the value to check
 * @returns true if the value is a string, false otherwise
 */
function isString(value) {
  return typeof value === 'string';
}

/**
 * Checks if a given value is a function
 * @param {any} value the value to check
 * @returns true if the value is a function, false otherwise
 */
function isFunction(value) {
  return value instanceof Function;
}

/**
 * Checks if a given value is a valid character
 * @param {any} value the value to check
 * @returns true if the value is a valid character, false otherwise
 */
function isValidChar(value) {
  const code = isString(value) && value.charCodeAt(0);
  return code === 45 || code === 46 || (code > 47 && code < 58) || (code > 64 && code < 91) || code === 95 || (code > 96 && code < 123);
}

/**
 * Checks if a given value is a valid string
 * @param {any} value the value to check
 * @returns true if the value is a valid string, false otherwise
 */
function isValidString(value) {
  return isString(value) && !!value.match(/^[A-z0-9_.-]+$/gi);
}

/**
 * Checks if a given value is the escape character
 * @param {any} value the value to check
 * @returns true if the value is the escape character, false otherwise
 */
function isEscapeMarker(value) {
  return value === ESCAPE;
}

module.exports = {
  isBoolean,
  isNumber,
  isString,
  isFunction,
  isValidChar,
  isValidString,
  isEscapeMarker,
};
