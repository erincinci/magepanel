/**
 * Module dependencies.
 */
var Common = require('../common');
var Convert = require('ansi-to-html');
var exec = require('child_process').exec;
var convert = new Convert();
convert.opts.newline = true;

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
    var selectedId = req.query.id;
    // Get project from DB
    Common.projectsDB.get(selectedId, function (err, project) {
        if (err) {
            console.error(err);
            return;
        }

        // Vars
        var cygwin_pre = "chdir " + settings.cygwinBin() + " & bash --login -c '";
        var cygwin_post = "'";

        // Clean result object
        project = Common.dbUtils.cleanResult(project);

        // Get project dir
        var projectDir = project.dir;

        // Replace cygwin dir if Windows
        if (Common.os == 'win32') {
            projectDir = projectDir.replace("C:", "/cygdrive/c");
            projectDir = projectDir.replace(/\\/g, "/");
        }

        // Prepare command
        var cdCommand = "cd " + projectDir + "; "
        var mageCommand = cdCommand + "mage " + req.query.cmd; // prepare mage command

        // Check OS
        if (Common.os == 'win32')
            mageCommand = cygwin_pre + mageCommand + cygwin_post;

        // Execute command
        console.debug("Command to be executed: " + mageCommand);
        exec(mageCommand, execCommand);
    });

    // Function for executing console command
    function execCommand(error, stdout, stderr) {
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
            output = convert.toHtml(stdout);
        }

        // Send output
        res.send(Common.config.html.consolePointer + output);
    }
};