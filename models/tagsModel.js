/**
 * Created by erinci on 15.07.2014.
 */
var model = require('nodejs-model');

// Create project tag model definition
module.exports = TagsModel = model("TagsModel")
    .attr('id')
    .attr('name')
    .attr('icon');

// Initialize object attributes
TagsModel.init = function(instance) {};