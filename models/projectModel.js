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
    .attr('tagId')
    .attr('branch')
    .attr('mailAddress')
    .attr('reportingEnabled')
    .attr('envs')
    .attr('tasks');

// Initialize object attributes
ProjectModel.init = function(instance) {
    instance.name("Default Project");
    instance.mailAddress("");
    instance.reportingEnabled(true);
};

// Object to string
exports.toString = toString = function(project) {
    var str = "<b>Name: </b>" + project.name +
        "<br><b>Dir: </b>" + project.dir +
        "<br><b>Branch: </b>" + project.branch +
        "<br><b>Tag ID: </b>" + project.tagId +
        "<br><b>Environments: </b>" + project.envs +
        "<br><b>Custom Tasks: </b>" + project.tasks +
        "<br><b>E-Mail: </b>" + project.mailAddress +
        "<br><b>Reporting Enabled?: </b>" + project.reportingEnabled;
    return str;
};