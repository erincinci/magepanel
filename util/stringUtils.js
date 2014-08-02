/**
 * Created by erincinci on 8/2/14.
 */
var _ = require('underscore');

/**
 * JS array to HTML list
 * @param dataArray
 * @returns {string}
 */
exports.arrayToList = function(dataArray) {
    var arrayValues = _.values(dataArray);

    if (_.size(dataArray) > 0) {
        var result = "<ul>";
    } else {
        return "N/A";
    }

    // Prepare HTML list
    _.each(arrayValues, function(value) {
        result += "<li>" + value + "</li>";
    });
    result += "</ul>";

    return result;
}