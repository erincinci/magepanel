/**
 * Module dependencies.
 */
var Common = require('../common');

/**
 * GET home page.
 */
exports.index = function(req, res) {
    // Check if application setup completed
    if(Common.setupCompleted !== undefined && Common.setupCompleted == true) {
        res.render('index', {
            username: Common.username,
            menu: 'home',
            title: 'Home',
            setupCompleted: Common.setupCompleted
        });
    } else {
        console.warn("Application is need to be setup..");
        res.redirect("/setup?status=incomplete");
    }

    // TODO DEBUG: Send mail
    Common.mailUtils.sendSuccessMail('erincinci@gmail.com', 'Customer Dashboard', 'Production', '325235064', 'erinci', '2014-09-12 17:17', '>> testing<br>>> new mail feature');
};