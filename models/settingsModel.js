/**
 * Created by erinci on 15.07.2014.
 */
var model = require('nodejs-model');

// Create web service call model definition
module.exports = SettingsModel = model("Wscall")
    .attr('setupCompleted')
    .attr('cygwinBin')
    .attr('mageDeployStrategy');

// Initialize object attributes
SettingsModel.init = function(instance) {
    instance.setupCompleted(false);
};