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

            // Prepare HTML output
            var projectLogsHTML = "";
            for (var i in projectLogs) {
                // Prepare vars
                var orgFile = project.dir + '/.mage/logs/' + projectLogs[i];
                var logDateTime = Common.S(projectLogs[i]).chompLeft('log-').chompRight('.log');
                var logDate = logDateTime.substr(0, 4) + "/" + logDateTime.substr(4, 2) + "/" + logDateTime.substr(6, 2);
                var logTime = logDateTime.substr(9, 2) + ":" + logDateTime.substr(11, 2) + ":" + logDateTime.substr(13, 2);

                projectLogsHTML
                    += "<span><a href='javascript:void(0);' type='button' onclick='tailLogFile(\""+orgFile+"\", \""+logDate+"\", \""+logTime+"\");' "
                        + "data-toggle='modal' data-target='#viewFileModal' style='text-decoration: none;'>"
                    + "<i class='glyphicon glyphicon-calendar'>" + logDate + "</i>"
                    + "   -   "
                    + "<i class='glyphicon glyphicon-time'>" + logTime + "</i>"
                    + "</a></span><br />";
            }

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
    // TODO: Kill process not working on Windows!
    tailProcess.kill();
    req.io.emit('logTailContent', { line: "Tail process closed", status: 'closed' });
}

/**
 * Pause Tail Log File
 * @param req
 */
exports.pauseTail = function(req) {
    // TODO: Pause tail not working on Windows!
    tailProcess.stdout.pause();
    req.io.emit('logTailContent', { line: "Tail process paused..", status: 'paused' });
}

/**
 * Resume Tail Log File
 * @param req
 */
exports.resumeTail = function(req) {
    // TODO: Resume tail not working on Windows!
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

