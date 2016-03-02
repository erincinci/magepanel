/**
 * Created by erincinci on 7/24/14.
 */
var _ = require('underscore');

/**
 * Clean DB Results Array
 * @param results
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
};

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
};

/**
 * Clear DB contents
 * @param db
 * @param callback
 */
exports.clearDB = function(db, callback) {
    // Select all elements from DB
    db.all(function(err, elements) {
        if (err)
            callback(err)

        // For each element in DB
        _.each(_.keys(elements), function(key) {
            // Remove from DB
            db.remove(key, function (err) {
                if (err)
                    console.error("Error while removing document:", err);
            });
        });

        callback(null);
    });
};