/**
 * Created by erinci on 18.07.2014.
 */
var Common = require('../common');
var model = require('nodejs-model');

// Create project model definition
module.exports = ProjectModel = model("Project")
    .attr('name')
    .attr('dir')
    .attr('environments')
    .attr('envConfigs');

// Initialize object attributes
ProjectModel.init = function(instance) {
    instance.name("Default Project");
};