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

    // TODO: Send mail
    Common.mailUtils.sendMail('erincinci@gmail.com', 'MagePanel', 'Successfully debugged NodeJS sendmail module..');
};