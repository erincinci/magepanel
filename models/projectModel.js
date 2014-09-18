/**
 * Created by erinci on 18.07.2014.
 */
var Common = require('../common');
var model = require('nodejs-model');

// Create project model definition
module.exports = ProjectModel = model("Project")
    .attr('id')
    .attr('name')
    .attr('dir')
    .attr('envs')
    .attr('tasks')
    .attr('email')
    .attr('reportingEnabled');

// Initialize object attributes
ProjectModel.init = function(instance) {
    instance.name("Default Project");
    instance.reportingEnabled = true;
    instance.email = '';
};

// Object to string
exports.toString = toString = function(project) {
    var str = "<b>Name: </b>" + project.name +
        "<br><b>Dir: </b>" + project.dir +
        "<br><b>Environments: </b>" + project.envs +
        "<br><b>Custom Tasks: </b>" + project.tasks +
        "<br><b>E-Mail: </b>" + project.email +
        "<br><b>Reporting Enabled?: </b>" + project.reportingEnabled;
    return str;
};