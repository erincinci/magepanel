/**
 * Module dependencies.
 */
var Common = require('../common');
var Convert = require('ansi-to-html');
var ansiTrim = require('cli-color/trim');
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
            content: Common.config.html.consolePointer + "Operating System: <b>" + Common.os + "</b><br>",
            projects: Common.dbUtils.cleanResults(projects)
        });
    });
};

/**
 * Mage Init Project
 * @param req
 */
exports.init = function(req, res) {
    var data = req.body;
    var projectDir = data['projectDir'];
    var projectName = data['projectName'];
    var projectMail = data['projectMail'];

    // Init variables
    settings.cygwinBin(Common.settings.get("cygwinBin"));
    var cygwin_pre = "chdir " + settings.cygwinBin() + " & bash --login -c '";
    var cygwin_post = "'";

    // Replace cygwin dir if Windows
    if (Common.os == 'win32') {
        projectDir = projectDir.replace("C:", "/cygdrive/c");
        projectDir = projectDir.replace(/\\/g, "/");
    }

    // Prepare init command
    var cdCommand = "cd " + projectDir + "; "
    var mageInitCommand = cdCommand + "mage init --name=\"" + projectName + "\" --email=\"" + projectMail + "\"";
    if (Common.os == 'win32')
        mageInitCommand = cygwin_pre + mageInitCommand + cygwin_post;

    // Execute mage init command on dir
    exec(mageInitCommand, function(err, stdout, stderr) {
        if(err)
            res.send({"warn": true, "message": "Got error during 'mage init' command: " + err});

        if(stderr) {
            console.error("STDERR during mage init of project: " + projectName + " - " + stderr);
        }

        console.debug("STDOUT during mage init of project: " + projectName + " - " + stdout);
        res.send({"warn": false, "message": "Successfully initialized project '" + projectName + "', please edit environments and tasks.."});
    });
}

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

        // Init variables
        var cygwin_pre = "chdir " + settings.cygwinBin() + " & bash --login -c '";
        var cygwin_post = "'";
        project = Common.dbUtils.cleanResult(project);
        var projectDir = project.dir;

        // Replace cygwin dir if Windows
        if (Common.os == 'win32') {
            projectDir = projectDir.replace("C:", "/cygdrive/c");
            projectDir = projectDir.replace(/\\/g, "/");
        }

        // Prepare command
        var cdCommand = "cd " + projectDir + "; "
        var mageCommand = cdCommand + "mage " + req.data.cmd;
        if (Common.os == 'win32')
            mageCommand = cygwin_pre + mageCommand + cygwin_post;

        // Use spawn instead of exec to get live stout data
        req.io.emit('cmdResponse', { result: Common.config.html.consolePointer, status: 'stdout' });
        var util  = require('util'),
            spawn = require('child_process').spawn;

        // Spawn command
        if (Common.os == 'win32') {
            var mageCmd = spawn('cmd', ['/c', mageCommand]);
        } else {
            var mageCmd = spawn('bash', []);
        }

        // Get realtime output
        var consoleOutput = '';
        mageCmd.stdout.on('data', function (data) {
            console.debug(data.toString());
            consoleOutput += ansiTrim(data.toString());
            req.io.emit('cmdResponse', { result: convert.toHtml(data.toString()), status: 'stdout' });
        });
        mageCmd.stderr.on('data', function (data) {
            console.error(data.toString());
            req.io.emit('cmdResponse', { result: convert.toHtml(data.toString()), status: 'stderr' });
        });

        // On process exit
        mageCmd.on('exit', function (code) {
            // TODO: If project report mailing is ON and e-mail address is valid
            //if(project.reportingEnabled && project.email != '') {
                // If command is DEPLOY and is SUCCESS, send report mail
                if (Common.S(req.data.cmd).include('deploy') && code == 0) {
                    // Parse project info from console output
                    var releaseId = Common.S(consoleOutput.match(/Release ID: *.*/g)).replaceAll('Release ID: ', '').s;
                    var environment = Common.S(consoleOutput.match(/Environment: *.*/g)).replaceAll('Environment: ', '').s;

                    /*console.debug("Mage command was: " + req.data.cmd + " | Includes deploy?: " + Common.S(req.data.cmd).include('deploy'));
                    console.debug("Process exit code: " + code);
                    console.debug("Parsed project info; releaseId: " + releaseId + " | Environment: " + environment);*/

                    // TODO: Get mail parameters from project
                    /*Common.mailUtils.sendSuccessMail(
                        project.email
                        project.name,
                        environment,
                        releaseId,
                        Common.username + ' (' + Common.os + ')',
                        new Date().toLocaleString(),
                        consoleOutput
                    );*/
                }
            /*} else {
                // If project email is empty, show warning to user
                req.io.emit('cmdResponse', { result: "Project's e-mail address is blank, please specify e-mail for automatic report mailing..", status: 'error' });
            }*/

            // Emit exit code to frontend
            console.log('Mage command exited with code ' + code);
            req.io.emit('cmdResponse', { result: code, status: 'exit' });
        });

        // If not on windows, wait some time and send command after connecting to bash shell
        if (Common.os != 'win32') {
             setTimeout(function() {
                mageCmd.stdin.write(mageCommand + '\n');
                mageCmd.stdin.end();
             }, 500);
        }
    });
};