/*
 * GET setup page
 */
var os = require('os').platform();
var username = require('username').sync();

/**
 * Index
 * @param req
 * @param res
 */
exports.index = function(req, res) {
    res.render('setup', {
        username: username,
        menu: 'setup',
        title: 'Application Setup',
        winEnv: (os == 'win32')
    });
};

/**
 * Save action
 * @param req
 * @param res
 */
exports.save = function(req, res) {
    // Get form data
    var data = req.body;
    // TODO: Implement settings saver

    res.send("Settings saved");
};