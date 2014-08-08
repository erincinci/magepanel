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
        return "";
    }

    // Prepare HTML list
    _.each(arrayValues, function(value) {

        // Read YML file content
        var ymlFile = projectDir + "/.mage/config/environment/" + value + ".yml";
        if (fs.existsSync(ymlFile))
            var ymlData = fs.readFileSync(ymlFile, 'utf8');
        else
            console.warn("Project file not found, maybe modified outside MagePanel?: " + ymlFile);

        // Create temp file for javascript to read file contents from
        var tmpPath = tempWrite.sync(ymlData, ymlFile);

        // Path fix
        tmpPath = tmpPath.replace(/\\/g, "/");
        var orgFile = ymlFile.replace(/\\/g, "/");

        // Create list item
        result += "<li><i>" + value + "</i>";
        result += " <a href='javascript:void(0);' style='text-decoration: none;' " +
            "rel='tooltip' class='glyphicon glyphicon-edit' data-original-title='Edit environment' " +
            "onclick='envListItemOnClick(\"" + tmpPath + "\", \"" + orgFile + "\", \"" + value + "\");'></a>";
        result += " <a href='javascript:void(0);' style='text-decoration: none;' " +
            "rel='tooltip' class='glyphicon glyphicon-remove' data-original-title='Delete environment' " +
            "onclick='alert(\"Are you sure?\")'></a></li>";

    });

    result += "</ul>";

    return result;
};

/**
 * JS tasks array to HTML list
 * @param taskArray
 * @returns {string}
 */
exports.taskArrayToList = function(taskArray, projectDir) {
    var arrayValues = _.values(taskArray);

    if (_.size(taskArray) > 0) {
        var result = "<ul>";
    } else {
        return "";
    }

    // Prepare HTML list
    _.each(arrayValues, function(value) {

        // Read PHP file content
        var phpFile = projectDir + "/.mage/tasks/" + value + ".php";
        if (fs.existsSync(phpFile))
            var phpData = fs.readFileSync(phpFile, 'utf8');
        else
            console.warn("Project file not found, maybe modified outside MagePanel?: " + phpFile);

        // Create temp file for javascript to read file contents from
        var tmpPath = tempWrite.sync(phpData, phpFile);

        // Path fix
        tmpPath = tmpPath.replace(/\\/g, "/");
        var orgFile = phpFile.replace(/\\/g, "/");

        // Create list item
        result += "<li><i>" + value + "</i>";
        result += " <a href='javascript:void(0);' style='text-decoration: none;' " +
            "rel='tooltip' class='glyphicon glyphicon-edit' data-original-title='Edit task' " +
            "onclick='taskListItemOnClick(\"" + tmpPath + "\", \"" + orgFile + "\", \"" + value + "\");'></a>";
        result += " <a href='javascript:void(0);' style='text-decoration: none;' " +
            "rel='tooltip' class='glyphicon glyphicon-remove' data-original-title='Delete task' " +
            "onclick='alert(\"Are you sure?\")'></a></li>";

    });

    result += "</ul>";

    return result;
};