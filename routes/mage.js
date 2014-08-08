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
 * IO mage command output
 */
exports.command = function(req) {
    var selectedId = req.data.id;

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
        var mageCommand = cdCommand + "mage " + req.data.cmd; // prepare mage command

        // Check OS
        if (Common.os == 'win32')
            mageCommand = cygwin_pre + mageCommand + cygwin_post;

        //console.debug("Command to be executed: " + mageCommand);

        // Use spawn instead of exec to get live stout data
        req.io.emit('cmdResponse', { result: Common.config.html.consolePointer, status: 'stdout' });
        var util  = require('util'),
            spawn = require('child_process').spawn;

        // Prepare spawn command
        if (Common.os == 'win32')
            var mageCmd = spawn('cmd', ['/c', mageCommand]);
        else
            var mageCmd = spawn(mageCommand, []);

        // Execute with spawn
        mageCmd.stdout.on('data', function (data) {
            console.debug(data.toString());
            req.io.emit('cmdResponse', { result: convert.toHtml(data.toString()), status: 'stdout' });
        });
        mageCmd.stderr.on('data', function (data) {
            console.error(data.toString());
            req.io.emit('cmdResponse', { result: convert.toHtml(data.toString()), status: 'stderr' });
        });
        mageCmd.on('exit', function (code) {
            console.log('child process exited with code ' + code);
            req.io.emit('cmdResponse', { result: code, status: 'exit' });
        });
    });
};