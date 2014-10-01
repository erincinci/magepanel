/**
 * Module dependencies.
 */
var spawn = require('child_process').spawn;
var Common = require('../common');
var fs = require('fs');

// Vars
var settings = Common.SettingsModel.create();
var title = "Logs";
var tailProcess = null;

/**
 * Get logs index
 * @param req
 * @param res
 */
exports.index = function(req, res) {
    // Get all projects from DB
    Common.projectsDB.all(function(err, projects) {
        if (err)
            console.error(err);

        res.render('mageLogs', {
            username: Common.username,
            menu: 'mageLogs',
            title: title,
            setupCompleted: Common.setupCompleted,
            projects: Common.dbUtils.cleanResults(projects)
        });
    });
};

/**
 * Get project's latest log file
 * @param req
 * @param res
 */
exports.projectLatestLog = function(req, res) {
    var selectedId = req.query.id;

    if(selectedId === 'undefined') {
        res.send("ID not found!");
        return;
    } else {
        // Get project from DB
        Common.projectsDB.get(selectedId, function (err, project) {
            if (err) {
                console.error(err);
                res.send("There was an error getting project logs!");
                return;
            }

            // Clean result object
            project = Common.dbUtils.cleanResult(project);
            project.dir = Common.S(project.dir).replaceAll("\\", "/").s;

            // Get project logs from dir
            var projectLogs = getProjectLogsFromDir(project.dir).sort().reverse();

            if (Common._.size(projectLogs) > 0) {
                // First log is the latest log, prepare JSON data to send
                var latestLog = projectLogs[0];
                var logDateTime = Common.S(latestLog).chompLeft('log-').chompRight('.log');
                var latestLogJson = {
                    "status" : "success",
                    "logFile": project.dir + '/.mage/logs/' + latestLog,
                    "logDate": logDateTime.substr(0, 4) + "/" + logDateTime.substr(4, 2) + "/" + logDateTime.substr(6, 2),
                    "logTime": logDateTime.substr(9, 2) + ":" + logDateTime.substr(11, 2) + ":" + logDateTime.substr(13, 2)
                }
                res.json(latestLogJson);
            }else{
                res.json({"status" : "warning","message":"No log file found"});
            }


        });
    }
}

/**
 * Get project logs
 * @param req
 * @param res
 */
exports.projectLogs = function(req, res) {
    var selectedId = req.query.id;

    if(selectedId === 'undefined') {
        res.send("ID not found!");
        return;
    } else {
        // Get project from DB
        Common.projectsDB.get(selectedId, function (err, project) {
            if (err) {
                console.error(err);
                res.send("There was an error getting project logs!");
                return;
            }

            // Clean result object
            project = Common.dbUtils.cleanResult(project);
            project.dir = Common.S(project.dir).replaceAll("\\", "/").s;

            // Get project logs from dir
            var projectLogs = getProjectLogsFromDir(project.dir).sort().reverse();

            // Group log times by dates
            var logSet = Common._.groupBy(projectLogs, function(logFile) {
                var logDateTime = Common.S(logFile).chompLeft('log-').chompRight('.log');
                var logDate = logDateTime.substr(0, 4) + "/" + logDateTime.substr(4, 2) + "/" + logDateTime.substr(6, 2);
                return logDate;
            });

            // Prepare HTML output
            var projectLogsHTML = '<div class="panel-group">';
            Common._.each(logSet, function(dateLogFiles, groupDate) {
                // Prepare date panel
                var groupId = Common.S(groupDate).replaceAll("/", "");
                projectLogsHTML
                    += '<div class="panel panel-default">'
                    + '<a class="list-group-item" data-toggle="collapse" href="#collapse' + groupId + '">'
                    + '<span class="badge">' + Common._.size(dateLogFiles) + '</span>'
                    + '<i class="glyphicon glyphicon-calendar" /> ' + groupDate + '</a>'
                    + '<div class="panel-collapse collapse" id="collapse' + groupId + '"><div class="panel-body">';

                // Add times for date group
                Common._.each(dateLogFiles, function(logFile) {
                    // Prepare variables
                    var orgFile = project.dir + '/.mage/logs/' + logFile;
                    var logDateTime = Common.S(logFile).chompLeft('log-').chompRight('.log');
                    var logDate = logDateTime.substr(0, 4) + "/" + logDateTime.substr(4, 2) + "/" + logDateTime.substr(6, 2);
                    var logTime = logDateTime.substr(9, 2) + ":" + logDateTime.substr(11, 2) + ":" + logDateTime.substr(13, 2);
                    var onClickHTML = "tailLogFile('"+orgFile+"', '"+logDate+"', '"+logTime+"');";

                    // Append log file to HTML
                    projectLogsHTML
                        += '<a href="#" onclick="'+onClickHTML+'" data-toggle="modal" data-target="#viewFileModal" '
                        + 'class="list-group-item glyphicon glyphicon-time">'
                        + logTime + '</a>';
                });

                // Finalize date group
                projectLogsHTML += '</div></div></div>';
            });
            projectLogsHTML += '</div>';

            res.send(projectLogsHTML);
        });
    }
};

/**
 * IO Tail Log
 * @param req
 */
exports.tailLog = function(req) {
    // File to tail
    var logFile = req.data.file;

    // Tail log file using system spawn command
    if (Common.os == 'win32') {
        // Prepare cygwin stuff for windows
        settings.cygwinBin(Common.settings.get("cygwinBin"));
        logFile = logFile.replace("C:", "/cygdrive/c");
        var cygwin_pre = "chdir " + settings.cygwinBin() + " & bash --login -c '";
        var cygwin_post = "'";

        var tailCommand = "tail -n 100 -f " + logFile;
        tailCommand = cygwin_pre + tailCommand + cygwin_post;
        tailProcess = spawn('cmd', ['/c', tailCommand]);
    } else {
        tailProcess = spawn('tail', ['-n', 100, '-f', logFile]);
    }

    // Get realtime tail output
    tailProcess.stdout.on('data', function (data) {
        req.io.emit('logTailContent', { line: data.toString(), status: 'running' });
    });
    tailProcess.stderr.on('data', function (data) {
        console.error(data.toString());
        req.io.emit('logTailContent', { line: data.toString(), status: 'error' });
    });
    tailProcess.on('exit', function (code) {
        console.log('Mage tail command exited with code ' + code);
    });
}

/**
 * Exit Tail Log File
 * @param req
 */
exports.exitTail = function(req) {
    // Kill process tree on Windows
    if (Common.os == 'win32') {
        var cp = require('child_process');
        cp.exec('taskkill /PID ' + tailProcess.pid + ' /T /F', function (error, stdout, stderr) {
            console.log('Windows Taskkill stdout: ' + stdout);
            if(stderr)
                console.log('Windows Taskkill stderr: ' + stderr);
            if(error)
                 console.error('Windows taskkill error: ' + error);
        });
    } else {
        tailProcess.kill();
    }
    req.io.emit('logTailContent', { line: "Tail process closed", status: 'closed' });
}

/**
 * Pause Tail Log File
 * @param req
 */
exports.pauseTail = function(req) {
    tailProcess.stdout.pause();
    req.io.emit('logTailContent', { line: "Tail process paused..", status: 'paused' });
}

/**
 * Resume Tail Log File
 * @param req
 */
exports.resumeTail = function(req) {
    tailProcess.stdout.resume();
    req.io.emit('logTailContent', { line: "Tail process resumed", err: true, status: 'resumed' });
}

/**
 * Get Project Logs from a dir as an array
 * @param projectDir
 * @returns {Array}
 */
function getProjectLogsFromDir(projectDir) {
    var projectLogs = [];
    var logFiles = fs.readdirSync(Common.path.resolve(projectDir + '/.mage/logs'));
    for (var i in logFiles) {
        if (Common.path.extname(logFiles[i]) == ".log") {
            projectLogs.push(Common.path.basename(logFiles[i], ".yml"));
        }
    }

    return projectLogs;
}

