/**
 * Module dependencies.
 */
var Common = require('../common');
var Convert = require('ansi-to-html');
var exec = require('child_process').exec;
var convert = new Convert();

// Vars
var settings = Common.SettingsModel.create();
var title = "Console";

/**
 * Get mage index
 */
exports.index = function(req, res) {
    // Get all projects from DB
    Common.projectsDB.all(function(err, projects) {
        if (err)
            console.error(err);

        // Check cygwin bin directory to show warning if necessary
        settings.cygwinBin(Common.settings.get("cygwinBin"));
        var pathWarning = false;

        if(Common.os == 'win32') {
            var fs = require('fs');
            if (! fs.existsSync(settings.cygwinBin())) {
                console.warn("Folder '%s' doesn't exists!", settings.cygwinBin());
                pathWarning = true;
            }
        }

        res.render('mage', {
            username: Common.username,
            menu: 'mage',
            title: title,
            setupCompleted: Common.setupCompleted,
            pathWarning: pathWarning,
            content: Common.config.html.consolePointer + "Operating System: <b>" + Common.os + "</b>",
            projects: Common.dbUtils.cleanResults(projects)
        });
    });
};

/**
 * GET mage command output
 */
exports.command = function(req, res) {
    var cygwin_pre = "chdir " + settings.cygwinBin() + " & bash --login -c '";
    var cygwin_post = "'";

    function puts(error, stdout, stderr) {
        var output;

        if (error) {
            //console.error(error);
            output = error;
        }
        if (stderr) {
            console.warn(stderr);
            output = stderr;
        }
        if (stdout) {
            console.debug(stdout);
            convert.newline = true;
            // TODO: newline option not working for ansi-to-html
            output = convert.toHtml(stdout);
        }

        // Send output
        res.send(Common.config.html.consolePointer + output);
    }

    var mageCommand = "mage " + req.query.cmd; // prepare mage command

    // Check OS
    if (Common.os == 'win32')
        mageCommand = cygwin_pre + mageCommand + cygwin_post;

    // Execute command
    exec(mageCommand, puts);
};