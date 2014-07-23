/**
 * Created by erincinci on 7/24/14.
 */
var _ = require('underscore');

/**
 * Clean DB Results Array
 * @param dirtyArray
 */
exports.cleanResults = function(results) {
    var dirtyArray = _.values(results);
    var cleanArray = [];
    _.each(dirtyArray, function(dirtyProject) {
        if (dirtyProject.attrs != null)
            cleanArray.push(dirtyProject.attrs);
        else
            cleanArray.push(dirtyProject);
    });

    return cleanArray;
}

/**
 * Clean DB Result Object
 * @param result
 * @returns {*}
 */
exports.cleanResult = function(result) {
    if (result.attrs != null)
        return result.attrs;
    else
        return result;
}