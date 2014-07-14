/**
 * Module dependencies.
 */
var Common = require('../common');

/**
 * GET home page.
 */
exports.index = function(req, res) {
    // Check if application setup completed
    var setupCompleted = Common.settings.get(Common.config.setup.completed);

    if(setupCompleted !== undefined && setupCompleted == true) {
        res.render('index', {
            username: Common.username,
            menu: 'home',
            title: 'MagePanel'
        });
    } else {
        console.warn("Application is need to be setup..");
        res.redirect("/setup?status=incomplete");
    }
};