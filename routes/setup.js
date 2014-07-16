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
    // Get settings from file
    var settings = Common.SettingsModel.create();
    settings.setupCompleted(Common.setupCompleted);

    settings.cygwinBin(Common.settings.get("cygwinBin"));
    if(typeof(settings.cygwinBin()) === 'undefined')
        settings.cygwinBin(Common.config.setup.defaultCygwinBin);
    settings.mageDeployStrategy(Common.settings.get("mageDeployStrategy"));
    if(typeof(settings.mageDeployStrategy()) === 'undefined')
        settings.mageDeployStrategy(Common.config.setup.defaultMageDeployStrategy);
    console.debug("Current Settings: ", settings.toJSON());

    res.render('setup', {
        username: Common.username,
        menu: 'setup',
        title: 'Application Setup',
        settings: settings,
        setupCompleted: Common.setupCompleted,
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

    // Save valid form data in settings file
    for (var input in data) {
        var value = data[input];
        console.log("Setting set: %s = %s", input, value);
        Common.settings.set(input, value);
    }

    // Set setup as completed
    Common.settings.set(Common.config.setup.completed, true);
    Common.setupCompleted = true;

    res.send("Settings successfully saved");
};