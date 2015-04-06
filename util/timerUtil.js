/**
 * Created by erincinci on 6/4/15.
 */
var DEFAULT_PRECISION = 3;
var start;

/**
 * Start timer
 */
exports.startTimer = function() {
    start = process.hrtime();
};

/**
 * Stop timer & Return elapsed time
 * @param precision
 */
exports.stopTimer = function(precision) {
    // Calculate elapsed time, divide by a million to get nano to milli
    var elapsed = process.hrtime(start)[1] / 1000000;
    return elapsed.toFixed(precision ? precision : DEFAULT_PRECISION);
};