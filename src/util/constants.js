/**
 * Denoting a function
 * @type {number}
 */
const FUNCTION = 0;

/**
 * Denoting a variable
 * @type {number}
 */
const VARIABLE = 1;

/**
 * The general minimum recursion depth
 * @type {number}
 */
const MIN_DEPTH = 1;

/**
 * The default recursion depth
 * @type {number}
 */
const STANDARD_DEPTH = 10;

/**
 * The general maximum recursion depth
 * @type {number}
 */
const MAX_DEPTH = 50;

/**
 * The empty character
 * @type {string}
 */
const EMPTY = '';

/**
 * The default marker character
 * @type {string}
 */
const MARKER = '$';

/**
 * The default left delimiter
 * @type {string}
 */
const LEFT_DELIMITER = '(';

/**
 * The default right delimiter
 * @type {string}
 */
const RIGHT_DELIMITER = ')';

/**
 * The escape character
 * @type {string}
 */
const ESCAPE = '\\';

/**
 * The valid marker characters
 * @type {string[]}
 */
const VALID_MARKERS = ['$', '?', '!', '/', '&', '#', '@', '+', '*', '§', '%'];

/**
 * The valid delimiter pairs
 * @type {string[]}
 */
const VALID_DELIMITERS = ['()', '[]', '{}', '<>'];

module.exports = {
  FUNCTION,
  VARIABLE,
  MIN_DEPTH,
  STANDARD_DEPTH,
  MAX_DEPTH,
  EMPTY,
  MARKER,
  LEFT_DELIMITER,
  RIGHT_DELIMITER,
  ESCAPE,
  VALID_MARKERS,
  VALID_DELIMITERS,
};
