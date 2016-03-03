/**
 * GET setup page
 */
var Common = require('../common');
var gitTools = require('../util/gitTools');

/**
 * Index
 * @param req
 * @param res
 */
exports.index = function(req, res) {
    // Get settings from file
    var settings = Common.SettingsModel.create();
    settings.setupCompleted(Common.setupCompleted);

    settings.sshPageantSupport(Common.settings.get("sshPageantSupport"));
    settings.cygwinBin(Common.settings.get("cygwinBin"));
    settings.defaultProjectDestDir(Common.settings.get("defaultProjectDestDir"));
    if(typeof(settings.cygwinBin()) === 'undefined')
        settings.cygwinBin(Common.config.setup.defaultCygwinBin);
    settings.mageDeployStrategy(Common.settings.get("mageDeployStrategy"));
    if(typeof(settings.mageDeployStrategy()) === 'undefined')
        settings.mageDeployStrategy(Common.config.setup.defaultMageDeployStrategy);

    // Mailer settings
    settings.mailerService(Common.settings.get("mailerService"));
    settings.mailerSmtpHost(Common.settings.get("mailerSmtpHost"));
    settings.mailerSmtpPort(Common.settings.get("mailerSmtpPort"));
    settings.mailerSmtpSecure(Common.settings.get("mailerSmtpSecure"));
    settings.mailerSmtpUser(Common.settings.get("mailerSmtpUser"));
    settings.mailerSmtpPass(Common.settings.get("mailerSmtpPass"));
    settings.mailerMandrillApiKey(Common.settings.get("mailerMandrillApiKey"));
    settings.mailerSendgridApiKey(Common.settings.get("mailerSendgridApiKey"));
    settings.mailerSesAccessKeyId(Common.settings.get("mailerSesAccessKeyId"));
    settings.mailerSesSecretAccessKey(Common.settings.get("mailerSesSecretAccessKey"));
    settings.mailerSendmailPath(Common.settings.get("mailerSendmailPath"));

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

/**
 * Get Revision Version for the application
 * @param req
 */
exports.revisionVersion = function(req) {
    // Get revision version number form the GIT
    gitTools.revisionVersion(Common.path.join(__dirname, '../'), function (err, revVersion) {
        if (err) {
            console.error("Error while checking for app updated on GIT: " + err.message);
            req.io.emit('revisionVersion', { err: true, version: err.message });
        } else {
            gitTools.latestCommitMsg(Common.path.join(__dirname, '../'), function (err, commitMsg) {
                if (err) {
                    console.error("Error while checking latest commit message on GIT: " + err.message);
                    req.io.emit('revisionVersion', { err: true, version: err.message });
                } else {
                    req.io.emit('revisionVersion', { err: false, version: "<b>" + revVersion + "</b><br>" + commitMsg });
                }
            });
        }
    });
};

/**
 * Check for application updates on GIT
 * @param req
 */
exports.checkUpdates = function(req) {
    // Check for GIT branch status
    gitTools.branchUpToDate(Common.path.join(__dirname, '../'), function (err, isUpToDate) {
        if (err) {
            console.error("Error while checking for app updated on GIT: " + err.message);
            req.io.emit('updateCheck', { status: "err", err: true, msg: 'Error while checking for updates ' + err.message });
        } else {
            // Check if up to date
            if (isUpToDate) {
                req.io.emit('updateCheck', { status: "ok", err: false, msg: 'Application already up to date' });
            } else {
                console.info("Updating application..");

                // Update app from GIT
                gitTools.pull(Common.path.join(__dirname, '../'), function (err, consoleOutput) {
                    if (err) {
                        console.error("Error while getting the update! " + err.message);
                        req.io.emit('updateCheck', { status: "err", err: true, msg: 'Error while getting updates ' + err.message });
                    } else {
                        gitTools.npmInstall(Common.path.join(__dirname, '../'), function(error, output) {
                            if (error) {
                                console.error("Error while installing NPM dependencies! " + err.message);
                                req.io.emit('updateCheck', { status: "err", err: true, msg: 'Error while installing NPM dependencies ' + err.message });
                            } else {
                                console.debug("Application updated successfully. " + consoleOutput);
                                req.io.emit('updateCheck', { status: "updated", err: false, msg: 'Application updated successfully' });
                            }
                        });
                    }
                });
            }
        }
    });
};