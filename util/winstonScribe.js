var util = require('util');
var path = require('path');
var winston = require('winston');
var config = require('../config');

/**
 * Scribe - Custom Winston Transport Constructor
 * @param options
 * @constructor
 */
function Scribe (options) {
    options = options || {};

    // Setup logger
    this.name  = 'Scribe.JS';
    this.level = options.level || 'debug';
    this.category = options.category || 'winston';
    this.formatter = options.formatter || _formatLogMessage;

    // Init Scribe.JS logger
    this.ScribeJs = require('scribe-js')({
        createDefaultConsole : false
    });
    this.scribe = this.ScribeJs.console({
        console : {
            timeColors: ['grey', 'underline']
        },
        createBasic: true,
        logWriter: {
            logWriter: {
                rootPath: config.logger.directory
            }
        }
    });
    this.scribe.addLogger('debug', 'blue');
    this.scribe.addLogger('warn', 'yellow');
}
util.inherits(Scribe, winston.Transport);

/**
 * Override logger function
 * @param level
 * @param msg
 * @param meta
 * @param done
 * @returns {*}
 */
Scribe.prototype.log = function (level, msg, meta, done) {
    this.scribe.tag(_getCallerFile())[level](msg);
    done(null, true);
};

/**
 * Export web panel for scribe.js
 * @returns {*}
 */
Scribe.prototype.webPanel = function() {
    return this.ScribeJs.webPanel();
};

/**
 * Format log message
 * @param entry
 * @returns {*}
 */
function _formatLogMessage(entry) {
    return JSON.stringify(entry);
}

/**
 * Find caller file name and details
 * @returns {string}
 * @private
 */
function _getCallerFile() {
    var fileName = "";
    var rowNumber = 0;
    var columnNumber = 0;
    var currentStackPosition = 9; // this is the start point for call stack
    try {
        throw new Error("Custom Error");
    } catch(e) {
        Error["prepareStackTrace"] = function() {
            return arguments[1];
        };
        Error.prepareStackTrace(e, function(){});
        fileName = path.basename(e.stack[currentStackPosition].getFileName());
        rowNumber = e.stack[currentStackPosition].getLineNumber();
        columnNumber = e.stack[currentStackPosition].getColumnNumber();
    }
    return fileName + " | " + rowNumber + ":" + columnNumber;
}

module.exports = winston.transports.Scribe = Scribe;