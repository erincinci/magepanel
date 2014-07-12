var settings = require('user-settings').file('.magePanelSettings');
var config = require('../config');

/*
 * GET home page.
 */
exports.index = function(req, res) {
    // Check if application setup completed
    var setupCompleted = settings.get(config.setup.completed);

    if(setupCompleted !== undefined) {
        res.render('index', { menu: 'home', title: 'MagePanel' });
    } else {
        console.warn("Application is need to be setup..");
        res.redirect("/setup");
    }
};