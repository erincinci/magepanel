/**
 * Module dependencies.
 */
var Common = require('../common');
var fsExtra = require('fs-extra');
var Convert = require('ansi-to-html');
var ansiTrim = require('cli-color/trim');
var gitTools = require('../util/gitTools');
var exec = require('child_process').exec;
//var get_ip = require('ipware')().get_ip;
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
            settings.sshPageantSupport(Common.settings.get("sshPageantSupport"));

            var fs = require('fs');
            if (! fs.existsSync(settings.cygwinBin())) {
                console.warn("Folder '%s' doesn't exists!", settings.cygwinBin());
                pathWarning = true;
            }
        }

        // Check if mailer options are set
        var mailerWarning = false;
        if (! Common.settings.get("mailerService")) {
            mailerWarning = true;
            console.warn("Mailer options are not set!");
        }

        // Get all tags from DB
        Common.tagsDB.all(function(err, tags) {
            if (err)
                console.error(err.message);

            res.render('mage', {
                username: Common.username,
                menu: 'mage',
                title: title,
                setupCompleted: Common.setupCompleted,
                pathWarning: pathWarning,
                mailerWarning: mailerWarning,
                content: Common.config.html.consolePointer + "Operating System: <b>" + Common.os + "</b><br>",
                projects: Common.dbUtils.cleanResults(projects),
                tags: Common.dbUtils.cleanResults(tags)
            });
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
    var projectDirOrg = projectDir;
    var projectName = data['projectName'];
    var projectMail = data['projectMail'];
    var selectedProjectDir = data['projectInitImport'];
    var importResponse;

    // Init variables
    settings.cygwinBin(Common.settings.get("cygwinBin"));
    var cygwin_pre = "chdir " + settings.cygwinBin() + " & bash --login -c '";
    var cygwin_post = "'";

    // Prepare mage binary location
    var mageBin = "php " + Common.path.resolve(Common.path.join(process.cwd(), "magallanes/bin/mage"));

    // Replace cygwin dir if Windows
    if (Common.os == 'win32') {
        projectDir = projectDir.replace("C:", "/cygdrive/c");
        projectDir = projectDir.replace(/\\/g, "/");

        mageBin = mageBin.replace("C:", "/cygdrive/c");
        mageBin = mageBin.replace(/\\/g, "/");
    }

    // Prepare init command
    var cdCommand = "cd " + projectDir + "; "
    var mageInitCommand = cdCommand + mageBin + " Init --name=\"" + projectName + "\" --email=\"" + projectMail + "\"";
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
        if (selectedProjectDir != "null") {
            importProject(projectDirOrg, selectedProjectDir);
            res.send({"warn": false, "message": "Successfully initialized project '" + projectName + "' and imported environments and tasks.."});
        } else {
            res.send({"warn": false, "message": "Successfully initialized project '" + projectName + "', please edit environments and tasks.."});
        }

    });
}

/**
 * Import project to new created one
 * @param projectDir
 * @param selectedProjectDir
 * @returns {Array}
 */
function importProject(projectDir, selectedProjectDir) {
    projectDir = Common.path.normalize(projectDir);
    selectedProjectDir = Common.path.normalize(selectedProjectDir);

    fsExtra.copySync(
        Common.path.join(selectedProjectDir, "/.mage/config/environment"),
        Common.path.join(projectDir, "/.mage/config/environment")
    );
    fsExtra.copySync(
        Common.path.join(selectedProjectDir, "/.mage/tasks"),
        Common.path.join(projectDir, "/.mage/tasks")
    );
}

/**
 * Prepare Console Messages
 * Error: #f99792, rgba(249, 151, 146, 0.3)
 * Warning: #fff48d, rgba(255, 244, 141, 0.3)
 * Success: NULL
 * @param msg
 */
function prepareConsoleMsg(status, msg) {
    // Prepare message according to the status of the message
    switch (status) {
        case Common.eCmdStatus.error:
            return Common.config.html.consolePointerErr + " <span style='background-color: rgba(249, 151, 146, 0.3);'>" + msg + "</span><br>";
        case Common.eCmdStatus.warning:
            return Common.config.html.consolePointerWarn + " <span style='background-color: rgba(255, 244, 141, 0.3);'>" + msg + "</span><br>";
        case Common.eCmdStatus.success:
            return msg;
        default:
            return msg;
    }
}

/**
 * IO mage command output
 */
exports.command = function(req) {
    var selectedId = req.data.id;

    // Get project from DB
    Common.projectsDB.get(selectedId, function (err, project) {
        if (err) {
            console.error(err.message);
            req.io.emit('cmdResponse', { result: prepareConsoleMsg(Common.eCmdStatus.error, err.message), status: Common.eCmdStatus.error });
            return;
        }

        // Init variables
        console.debug("SSH-Pageant support: " + settings.sshPageantSupport());
        if (settings.sshPageantSupport() == 'true')
            var cygwin_pre = "chdir " + settings.cygwinBin() + " & bash --login -c 'eval $(/usr/bin/ssh-pageant -ra /tmp/.ssh-pageant); keychain -q -Q; . ~/.keychain/`hostname`-sh; ";
        else
            var cygwin_pre = "chdir " + settings.cygwinBin() + " & bash --login -c '";
        var cygwin_post = "'";
        project = Common.dbUtils.cleanResult(project);
        var projectDir = project.dir;

        // Prepare mage binary location
        var mageBin = "php " + Common.path.resolve(Common.path.join(process.cwd(), "magallanes/bin/mage"));

        // Replace cygwin dir if Windows
        if (Common.os == 'win32') {
            projectDir = projectDir.replace("C:", "/cygdrive/c");
            projectDir = projectDir.replace(/\\/g, "/");

            mageBin = mageBin.replace("C:", "/cygdrive/c");
            mageBin = mageBin.replace(/\\/g, "/");
        }

        // Prepare command
        var cdCommand = "cd " + projectDir + "; "
        var mageCommand = cdCommand + mageBin + " " + req.data.cmd;
        if (Common.os == 'win32')
            mageCommand = cygwin_pre + mageCommand + cygwin_post;

        // Use spawn instead of exec to get live stout data
        req.io.emit('cmdResponse', { result: Common.config.html.consolePointer, status: Common.eCmdStatus.success });
        var util  = require('util'),
            spawn = require('child_process').spawn;

        // Start timer for deploy cmd - Stats
        if (Common.S(req.data.cmd).include('deploy'))
            Common.timerUtil.startTimer();

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
            req.io.emit('cmdResponse', { result: convert.toHtml(data.toString()), status: Common.eCmdStatus.success });
        });
        mageCmd.stderr.on('data', function (data) {
            console.error(data.toString());
            req.io.emit('cmdResponse', { result: convert.toHtml(data.toString()), status: Common.eCmdStatus.error });
        });

        // On process exit
        mageCmd.on('exit', function (code) {
            // If command is DEPLOY
            if (Common.S(req.data.cmd).include('deploy')) {
                console.debug("Mage command was DEPLOY");

                // Calculate elapsed time for stats
                var elapsedTime = Common.timerUtil.stopTimer(0);
                console.info("Elapsed time for deploy: " + elapsedTime + "ms");
                Common.stats.addDeployTime(elapsedTime);

                // If deploy command is SUCCESS
                if (code == 0) {
                    console.debug("Deploy command was SUCCESS");
                    Common.stats.incDeploysSuccess();

                    // If GIT Tagging is ON
                    if (req.data.tag) {
                        gitTools.tag(project.dir, req.data.tag, function(gitTagErr, gitTagOutput) {
                            if (gitTagErr)
                                req.io.emit('cmdResponse', { result: "Failed tagging GIT repo, " + gitTagErr.message, status: Common.eCmdStatus.warning });
                            else {
                                req.io.emit('cmdResponse', { result: "GIT repository successfully tagged! (" + req.data.tag + ")", status: Common.eCmdStatus.success });
                                console.debug("GIT Tag command output: " + gitTagOutput);
                            }
                        });
                    }

                    // If auto-reporting is ENABLED
                    if(project.reportingEnabled == true) {
                        console.debug("Project Auto-Reporting is ENABLED");

                        // If e-mail addresses are VALID
                        var emailError = Common.mailUtils.validateMailAddresses(project.mailAddress);
                        if (emailError == null) {
                            console.debug("E-Mail addresses are valid, sending report mail(s)..");

                            // Parse project info from console output
                            var releaseId = Common.S(consoleOutput.match(/Release ID: *.*/g)).replaceAll('Release ID: ', '').s;
                            var environment = Common.S(consoleOutput.match(/Environment: *.*/g)).replaceAll('Environment: ', '').s;

                            // Get mail parameters from project
                            var clientIp = req.socket.manager.handshaken[req.socket.id].address.address;
                            if (clientIp)
                                clientIp = clientIp.replace("::ffff:", '');
                            Common.mailUtils.sendSuccessMail(
                                req.io,
                                project.mailAddress,
                                project.name,
                                environment,
                                releaseId,
                                Common.username + ' (IP: ' + clientIp + ')',
                                new Date().toLocaleString(),
                                consoleOutput
                            );
                            Common.stats.incMailsSent();
                        } else {
                            // E-mail address is not valid, show warning..
                            console.warn("Project's e-mail addresses are invalid!");
                            req.io.emit('cmdResponse', { result: "Failed sending report mail(s), " + emailError, status: Common.eCmdStatus.warning });
                        }
                    }
                } else {
                    // If deploy was failed
                    Common.stats.incDeploysFail();
                    console.warn('Mage deploy failed!');
                    req.io.emit('cmdResponse', { result: "Mage deploy failed!", status: Common.eCmdStatus.exit });
                }
            } else if (Common.S(req.data.cmd).include('rollback')) {
                // If command was mage rollback
                Common.stats.incRollbacks();
            }

            // Emit exit code to frontend
            console.warn('Mage command exited with code ' + code);
            req.io.emit('cmdResponse', { result: code, status: Common.eCmdStatus.exit });
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