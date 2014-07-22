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
    .attr('environments')
    .attr('envConfigs');

// Initialize object attributes
ProjectModel.init = function(instance) {
    instance.name("Default Project");
};

// Object to string
exports.toString = toString = function(project) {
    var str = "<b>Name: </b>" + project.name +
        "<br><b>Dir: </b>" + project.dir +
        "<br><b>Environments: </b>" + project.environments;
    return str;
};