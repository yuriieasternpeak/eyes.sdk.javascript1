'use strict';

const stackTrace = require('stack-trace');

const { GeneralUtils } = require('../utils/GeneralUtils');
const { NullLogHandler } = require('./NullLogHandler');

/**
 * Write log massages using the provided Log Handler
 */
class Logger {
  constructor() {
    this._logHandler = new NullLogHandler(); // Default.
    this._sessionId = '';
  }

  /**
   * @param {string} sessionId
   */
  setSessionId(sessionId) {
    this._sessionId = sessionId;
  }

  /**
   * @return {LogHandler} The currently set log handler.
   */
  getLogHandler() {
    return this._logHandler;
  }

  /**
   * @param {LogHandler} [handler] The log handler to set. If you want a log handler which does nothing, use
   *   {@link NullLogHandler}.
   */
  setLogHandler(handler) {
    this._logHandler = handler || new NullLogHandler();
  }

  /**
   * Writes a verbose write message.
   *
   * @param {*} args
   */
  verbose(...args) {
    this._logHandler.onMessage(true, `[VERBOSE] ${this._getPrefix()}${GeneralUtils.stringify(...args)}`);
  }

  /**
   * Writes a (non-verbose) write message.
   *
   * @param {*} args
   */
  log(...args) {
    this._logHandler.onMessage(false, `[LOG    ] ${this._getPrefix()}${GeneralUtils.stringify(...args)}`);
  }

  // noinspection JSMethodCanBeStatic
  /**
   * @private
   * @return {string} The name of the method which called the logger, if possible, or an empty string.
   */
  _getPrefix() {
    /**
     * @typedef {object} CallSite
     * @property {function} getTypeName returns the type of this as a string.
     * @property {function} getFunctionName returns the name of the current function, typically its name property.
     * @property {function} getMethodName returns the name of the property of this or one of its prototypes that holds
     *   the current function
     * @property {function} getFileName if this function was defined in a script returns the name of the script
     * @property {function} getLineNumber if this function was defined in a script returns the current line number
     * @property {function} getColumnNumber if this function was defined in a script returns the current column number
     * @property {function} isNative is this call in native V8 code?
     *//** @type {CallSite[]} */
    const trace = stackTrace.get();

    let prefix = `{${this._sessionId}} `;
    // _getPrefix() <- log()/verbose() <- "actual caller"
    if (trace && trace.length >= 2) {
      const className = trace[2].getTypeName();
      const methodName = trace[2].getMethodName();

      if (className && methodName) {
        prefix += `${className}.${methodName}(): `;
      } else {
        prefix += '(): ';
      }
    }

    return prefix;
  }
}

exports.Logger = Logger;
