/**
 * GET setup page
 */
var Common = require('../common');

/**
 * Index
 * @param req
 * @param res
 */
exports.index = function(req, res) {
    res.render('setup', {
        username: Common.username,
        menu: 'setup',
        title: 'Application Setup',
        winEnv: (Common.os == 'win32')
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
    console.debug("cygwinBin: %s", data.cygwinBin);
    console.debug("mageDeployStrategy: %s", data.mageDeployStrategy);

    res.send("Settings saved");
};