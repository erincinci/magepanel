/**
 * Created by erincinci on 8/2/14.
 */
var Common = require('../common');
var fs = require('fs');
var tempWrite = require('./temp-write');
var _ = require('underscore');

/**
 * JS environments array to HTML list
 * @param envArray
 * @returns {string}
 */
exports.envArrayToList = function(envArray, projectDir) {
    var arrayValues = _.values(envArray);

    if (_.size(envArray) > 0) {
        var result = "<ul>";
    } else {
        return "N/A";
    }

    // Prepare HTML list
    _.each(arrayValues, function(value) {

        // Read YML file content
        var ymlFile = projectDir + "/.mage/config/environment/" + value + ".yml";
        var ymlData = fs.readFileSync(ymlFile, 'utf8');

        // Create temp file for javascript to read file contents from
        var tmpPath = tempWrite.sync(ymlData, ymlFile);

        // Create list item
        result += "<li><a href='javascript:void(0);' onclick='envListItemOnClick(\"" + tmpPath + "\");'>" + value + "</a></li>";

    });

    result += "</ul>";

    return result;
}