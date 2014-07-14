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
    var setupCompleted = Common.settings.get(Common.config.setup.completed);
    console.debug("Setup completed: ", setupCompleted);

    var cygwinBin = Common.settings.get("cygwinBin");
    if(typeof(cygwinBin) === 'undefined')
        cygwinBin = "C:\\cygwin\\bin";
    var mageDeployStrategy = Common.settings.get("mageDeployStrategy");
    if(typeof(mageDeployStrategy) === 'undefined')
        mageDeployStrategy = 'rsync';
    var formData = {
        'cygwinBin' : cygwinBin,
        'mageDeployStrategy' : mageDeployStrategy
    };
    console.debug("Current Settings: ", formData);

    res.render('setup', {
        username: Common.username,
        menu: 'setup',
        title: 'Application Setup',
        formData: formData,
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
    Common.settings.set(Common.config.setup.completed, true);

    res.send("Settings successfully saved");
};