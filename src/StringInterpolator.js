const InvalidInterpolationException = require('./util/InvalidInterpolationException');

const {
  FUNCTION,
  VARIABLE,
  MIN_DEPTH,
  STANDARD_DEPTH,
  MAX_DEPTH,
  EMPTY,
  MARKER,
  LEFT_DELIMITER,
  RIGHT_DELIMITER,
  VALID_MARKERS,
  VALID_DELIMITERS,
} = require('./util/constants');

const {
  isBoolean,
  isNumber,
  isString,
  isFunction,
  isValidChar,
  isValidString,
  isEscapeMarker,
} = require('./util/helper');

/**
 * This class provides all the functionalities to process and interpolate strings with given data
 */
class StringInterpolator {
  /**
   *
   * @param {object} options the options to instantiate the StringInterpolator object with
   * @param {number} [options.maxDepth=10] the maximum recursion depth to search in, default: 10
   * @param {string} [options.marker=$] the character marking a variable or function, default: '$'
   * @param {string} [options.delimiters=()] a string containing the delimiters in order, default: "()"
   * @param {boolean} [options.log=false] set to true if debug logging should be activated, default: false
   */
  constructor(options = {}) {
    const opts = options || {};
    let {
      maxDepth = STANDARD_DEPTH,
      marker = MARKER,
    } = opts;

    if (maxDepth < MIN_DEPTH) {
      maxDepth = MIN_DEPTH;
    } else if (!isNumber(maxDepth) || maxDepth > MAX_DEPTH) {
      maxDepth = MAX_DEPTH;
    }

    if (!VALID_MARKERS.includes(marker)) {
      marker = MARKER;
    }

    if (VALID_DELIMITERS.includes(opts.delimiters)) {
      [this.leftDelimiter, this.rightDelimiter] = opts.delimiters;
    } else {
      this.leftDelimiter = LEFT_DELIMITER;
      this.rightDelimiter = RIGHT_DELIMITER;
    }

    this.maxDepth = maxDepth;
    this.marker = marker;
    this.log = !!opts.log;

    this.variables = {};
    this.functions = {};
  }

  /**
   * Checks if the current recursion depth is greater or equal to the maximum allowed depth
   * @param {number} value the recursion depth
   * @returns true if the recursion depth is greater or equal to the maximum depth allowed, false otherwise
   */
  isMaxDepth(value) {
    return value >= this.maxDepth;
  }

  /**
   * Checks if the currently processed character is a marker
   * @param {string} value the currently processed character
   * @returns true if the currently processed character is a marker
   */
  isMarker(value) {
    return value === this.marker;
  }

  /**
   * Checks if the currently processed character is a left delimiter of a function
   * @param {string} value the currently processed character
   * @returns true if the currently processed character is a left delimiter of a function
   */
  isLeftDelimiter(value) {
    return value === this.leftDelimiter;
  }

  /**
   * Checks if the currently processed character is a right delimiter of a function
   * @param {string} value the currently processed character
   * @returns true if the currently processed character is a right delimiter of a function
   */
  isRightDelimiter(value) {
    return value === this.rightDelimiter;
  }

  /**
   * Prints, if logging is activated, a stacktrace of a given InvalidInterpolationException or just a normal message
   * @param {InvalidInterpolationException|string} e the underlying error or a message
   */
  printLog(e) {
    if (this.log) {
      console.error(e.stack || e);
    }
  }

  /**
   * Adds a callback to the functions or variables lookup map with the given name
   * @param {number} isVar 0 for a function, anything truthy for a variable
   * @param {string} name the name of the variable or function
   * @param {string|number|function} callback the callback to add to the functions or variables lookup map
   */
  addCallback(isVar, name, callback = null) {
    const validName = isValidString(name);
    const validCallback = isBoolean(callback) || isNumber(callback) || isString(callback) || isFunction(callback);
    const key = `${this.marker}${name}`;
    const type = isVar ? 'variable' : 'function';
    const lookup = isVar ? this.variables : this.functions;

    if (validName && validCallback) {
      lookup[key] = (data, content) => {
        const replacement = key + (isVar ? EMPTY : `${this.leftDelimiter}${content}${this.rightDelimiter}`);
        const message = `Couldn't replace ${type} "${replacement}"`;
        if (!isFunction(callback)) {
          return String(callback);
        }
        try {
          const result = callback(data, isVar ? undefined : content);
          if (!isBoolean(result) && !isNumber(result) && !isString(result)) {
            throw new InvalidInterpolationException(message, replacement);
          }
          return String(result);
        } catch (error) {
          throw error instanceof InvalidInterpolationException ? error : new InvalidInterpolationException(message, replacement);
        }
      };
    } else if (!validName) {
      this.printLog(`Couldn't add ${type} "${this.marker}${name}" because the name was invalid!`);
    } else {
      this.printLog(`Couldn't add ${type} "${this.marker}${name}" because the callback provided was invalid!`);
    }
  }

  /**
   * Adds a variable to the variables lookup map with the given name
   * @param {string} name the name of the variable
   * @param {function|string|number} callback the callback to add to the variables lookup map
   */
  addVariable(name, callback = null) {
    this.addCallback(VARIABLE, name, callback);
  }

  /**
   * Adds a function to the functions lookup map with the given name
   * @param {string} name the name of the function
   * @param {function|string|number} callback the callback to add to the functions lookup map
   */
  addFunction(name, callback = null) {
    this.addCallback(FUNCTION, name, callback);
  }

  /**
   * Processes a variable or function and fills the result property of the given search meta object
   * @param {number} isVar 0 for a function, anything truthy for a variable
   * @param {object} meta the search meta object
   * @param {string} meta.key the key to use in the lookup map for variables or functions
   * @param {string} meta.search the currently unprocessed text to yet be added to the result
   * @param {string} meta.result the current result of the interpolation
   * @param {number} meta.imbalance the imbalance of left and right delimiters of the current search
   * @param {object} data the data object to interpolate upon
   * @param {number} depth the current recursion depth
   */
  fillResult(isVar, meta, data, depth) {
    try {
      if (isVar) {
        meta.result += (meta.key ? this.process(this.variables[meta.key](data), data, depth + 1) : EMPTY) + meta.search.substring(meta.key.length);
      } else {
        meta.result += this.process(this.functions[meta.key](data, this.process(meta.search, data, depth + 1)), data, depth + 1);
      }
    } catch (e) {
      this.printLog(e);
      meta.result += e.replacement + (isVar ? meta.search.substring(meta.key.length) : EMPTY);
    }
  }

  /**
   * Processes and interpolates a template upon a given data object
   * @param {string} template the template to interpolate
   * @param {object} data the data object to interpolate upon
   * @param {number} [depth=0] the current recursion depth
   * @returns
   */
  process(template, data, depth = 0) {
    if (this.isMaxDepth(depth) || !template.length) {
      return template;
    }
    let char = EMPTY;
    let left = 0;
    let right = 0;
    let start = false;
    let escape = false;
    let end = false;
    let valid = false;

    const meta = {
      search: EMPTY,
      key: EMPTY,
      result: EMPTY,
      imbalance: 0,
    };

    for (let i = 0; i < template.length; i += 1) {
      char = template[i];
      end = template.length === i + 1;
      valid = isValidChar(char);
      left = Number(!escape && this.isLeftDelimiter(char));
      right = Number(!escape && this.isRightDelimiter(char));
      start = !escape && this.isMarker(char);
      escape = !escape && isEscapeMarker(char);
      if (meta.imbalance) {
        meta.imbalance += left - right;
        meta.search += meta.imbalance ? char : EMPTY;
        if (!meta.imbalance) {
          this.fillResult(FUNCTION, meta, data, depth);
          meta.search = EMPTY;
          meta.key = EMPTY;
          meta.search = EMPTY;
        } else if (end) {
          meta.result += `${meta.key}${this.leftDelimiter}${meta.search}`;
        }
      } else if (left && this.functions[meta.search]) {
        meta.imbalance = left;
        meta.key = meta.search;
        meta.search = EMPTY;
      } else {
        if (end || valid || !start) {
          meta.search += char;
          meta.key = this.variables[meta.search] ? meta.search : meta.key;
        }
        if (end || !valid) {
          this.fillResult(VARIABLE, meta, data, depth);
          meta.search = start ? this.marker : EMPTY;
          meta.key = EMPTY;
        }
      }
    }
    return depth ? meta.result : meta.result.replace(/\\(.)/g, '$1');
  }
}

module.exports = StringInterpolator;
