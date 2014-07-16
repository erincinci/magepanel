/**
 * Module dependencies.
 */
var Common = require('../common');

// Vars
var settings = Common.SettingsModel.create();
var title = "Projects";

/**
 * Get projects index
 */
exports.index = function(req, res) {
    res.render('projects', {
        username: Common.username,
        menu: 'projects',
        title: title,
        setupCompleted: Common.setupCompleted
    });
};

/**
 * Add project
 */
exports.add = function(req, res) {
    // TODO
};