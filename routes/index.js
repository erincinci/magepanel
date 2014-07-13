var username = require('username').sync();
var config = require('../config');
var settings = require('user-settings').file(config.setup.file);

/**
 * GET home page.
 */
exports.index = function(req, res) {
    // Check if application setup completed
    var setupCompleted = settings.get(config.setup.completed);

    if(setupCompleted !== undefined) {
        res.render('index', {
            username: username,
            menu: 'home',
            title: 'MagePanel'
        });
    } else {
        console.warn("Application is need to be setup..");
        res.redirect("/setup?status=incomplete");
    }
};