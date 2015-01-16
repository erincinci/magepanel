/**
 * Module dependencies.
 */
var Common = require('../common');
var fs = require('fs');
var tempWrite = require('../util/temp-write');
var gitTools = require('../util/gitTools');

// Vars
var settings = Common.SettingsModel.create();
var title = "Projects";

/**
 * Get projects index
 * @param req
 * @param res
 */
exports.index = function(req, res) {
    // Get all projects from DB
    Common.projectsDB.all(function(err, projects) {
        if (err)
            console.error(err);

        res.render('projects', {
            username: Common.username,
            menu: 'projects',
            title: title,
            setupCompleted: Common.setupCompleted,
            projects: Common.dbUtils.cleanResults(projects)
        });
    });

    // Clean temp folder
    tempWrite.cleanTmp();
};

/**
 * Add project
 * @param req
 * @param res
 */
exports.add = function(req, res) {
    // Get form data
    var data = req.body;

    // Check if project dir contains .mage directory
    if (! fs.existsSync(data['projectDir']+'/.mage')) {
        console.warn("Mage directory not found in the path!");
        res.send({"warn": true, "message": "Mage directory not found in the path! Please init project first"});
        return;
    }

    // Create project object
    var id = Common.uuid.v1();
    var project = Common.ProjectModel.create();
    project.id(id);
    project.dir(Common.path.resolve(data['projectDir']));
    project.name(data['projectName']);
    project.mailAddress(data['projectMail']);
    if (data['projectReportingEnabled'] == 'On')
        project.reportingEnabled(true);
    else
        project.reportingEnabled(false);

    // TODO: Check if projects already exists in DB
    /*Common.projectsDB.find({dir: project.dir()}, function(err, result) {
        if (err) {
            console.error(err);
            res.send({"warn": true, "message": "Internal error while adding project!"});
            return;
        }

        if (Object.keys(result).length > 0) {
            console.warn("Project already in DB");
            res.send({"warn": true, "message": "Project exists in DB"});
            return;
        }
    });*/

    // Get project environments & tasks
    project.envs(getProjectEnvs(project.dir()));
    project.tasks(getProjectTasks(project.dir()));

    // Add project to DB
    Common.projectsDB.save(id, project, function(err) {
        if (err) {
            console.error(err);
            res.send({"warn": true, "message": "Internal error while adding project!"});
            return;
        }

        res.send({"warn": false, "message": "Project successfully added/changed"});
    });
};

/**
 * Refresh Project
 * @param req
 * @param res
 */
exports.refresh = function(req, res) {
    var selectedId = req.query.id;

    if(selectedId === 'undefined') {
        res.send({"warn": true, "message": "ID not found!"});
        return;
    } else {
        Common.projectsDB.get(selectedId, function (err, project) {
            if (err) {
                console.error(selectedId + ": " + err);
                res.send({"warn": true, "message": "There was an error getting project from DB!"});
                return;
            }

            // Clean result object
            project = Common.dbUtils.cleanResult(project);
            project.dir = Common.path.normalize(project.dir);

            // Create refreshed project
            var refreshedProject = Common.ProjectModel.create();
            refreshedProject.id(project.id);
            refreshedProject.dir(project.dir);
            refreshedProject.name(project.name);
            refreshedProject.envs(getProjectEnvs(project.dir));
            refreshedProject.tasks(getProjectTasks(project.dir));
            refreshedProject.mailAddress(project.mailAddress);
            refreshedProject.reportingEnabled(project.reportingEnabled);

            // Refresh project at DB
            Common.projectsDB.save(selectedId, refreshedProject, function(err) {
                if (err) {
                    console.error(err);
                    res.send({"warn": true, "message": "Internal error while refreshing project!"});
                    return;
                }

                res.send({"warn": false, "message": "Project successfully refreshed"});
            });
        });
    }
};

/**
 * GIT Pull Project
 * @param req
 * @param res
 */
exports.gitPull = function(req, res) {
    var selectedId = req.query.id;

    if(selectedId === 'undefined') {
        res.send({"warn": true, "message": "ID not found!"});
        return;
    } else {
        Common.projectsDB.get(selectedId, function (err, project) {
            if (err) {
                console.error(selectedId + ": " + err);
                res.send({"warn": true, "message": "There was an error getting project from DB!"});
                return;
            }

            // Clean result object
            project = Common.dbUtils.cleanResult(project);
            project.dir = Common.path.normalize(project.dir);

            // Send git pull command on project directory
            console.debug("GIT pull on dir " + project.dir);
            gitTools.pull(project.dir, function (err, consoleOutput) {
                if (err) {
                    res.send({ "warn": true, "message": "Error: " + err + " | Output: " + consoleOutput });
                } else {
                    res.send({ "warn": false, "message": "GIT Pull Success! : " + consoleOutput });
                }
            });
        });
    }
};

/**
 * Delete project
 * @param req
 * @param res
 */
exports.delete = function(req, res) {
    var selectedId = req.query.id;

    // Delete from DB
    Common.projectsDB.remove(selectedId, function (err) {
        if (err) {
            console.error(err);
            res.send({ "warn": true, "message": "ID: " + selectedId + " not found in DB!" });
            return;
        }

        res.send({ "warn": false, "message": "Removed from DB" });
    });

};

/**
 * Delete project file
 * @param req
 * @param res
 */
exports.deleteFile = function(req, res) {
    var fileToDel = req.query.file;

    // Delete project file
    if (fs.existsSync(fileToDel)) {
        // TODO: Node process blocks deleted file until process exit on Windows!
        fs.unlinkSync(fileToDel);
        res.send({ "warn": false, "message": "Successfully deleted project file" });
    } else {
        res.send({ "warn": true, "message": "File cannot be found!" });
    }
};

/**
 * Create New Project Environment File
 * @param req
 * @param res
 */
exports.addEnvFile = function(req, res) {
    // Get env name from form data
    var templateFile = "public/file-templates/environment.yml";
    var selectedId = req.body['projectId'];
    var newFileName = req.body['envName'];

    Common.projectsDB.get(selectedId, function (err, project) {
        if (err) {
            res.send({"warn": true, "message": "There was an error creating environment file!"});
            return;
        }

        // Clean result object
        project = Common.dbUtils.cleanResult(project);
        project.dir = Common.path.normalize(project.dir);

        // Create new environment file
        var newFilePath = Common.path.join(project.dir, "/.mage/config/environment/", newFileName + ".yml");
        fs.openSync(newFilePath, 'w');

        // Fill contents using template file
        var fileContent = fs.readFileSync(templateFile).toString();
        fileContent = fileContent.replace(/REPLACETHIS/g, newFileName);
        fs.writeFileSync(newFilePath, fileContent);

        res.send({ "warn": false, "message": "New environment added: " + newFileName });
    });
};

/**
 * Create New Custom Project Task File
 * @param req
 * @param res
 */
exports.addTaskFile = function(req, res) {
    // Get task name from form data
    var selectedId = req.body['projectId'];
    var newFileName = req.body['taskName'];
    var rollbackAware = req.body['rollbackAware'];
    var templatePath = "public/file-templates/";
    var templateFile;

    if (rollbackAware == "on") {
        var templateFile = templatePath + "Task-RollbackAware.php";
    }else{
        var templateFile = templatePath + "Task.php";
    }

    Common.projectsDB.get(selectedId, function (err, project) {
        if (err) {
            res.send({"warn": true, "message": "There was an error creating custom task file!"});
            return;
        }

        // Clean result object
        project = Common.dbUtils.cleanResult(project);
        project.dir = Common.path.normalize(project.dir);

        // Create new task file
        var newFilePath = Common.path.join(project.dir, "/.mage/tasks/", newFileName + ".php");
        fs.openSync(newFilePath, 'w');

        // Fill contents using template file
        var fileContent = fs.readFileSync(templateFile).toString();
        fileContent = fileContent.replace(/REPLACETHIS/g, newFileName);
        fs.writeFileSync(newFilePath, fileContent);

        res.send({ "warn": false, "message": "New custom task created: " + newFileName });
    });
};

/**
 * Get project detail
 * @param req
 * @param res
 */
exports.detail = function(req, res) {
    var selectedId = req.query.id;

    if(selectedId === 'undefined') {
        res.send("ID not found!");
        return;
    } else {
        // Get project from DB
        Common.projectsDB.get(selectedId, function (err, project) {
            if (err) {
                console.error(err);
                res.send("There was an error getting project details!");
                return;
            }

            // Clean result object
            project = Common.dbUtils.cleanResult(project);
            var projectEnvSize = Common._.size(project.envs);
            var projectTaskSize = Common._.size(project.tasks);
            if (project.reportingEnabled)
                var reportingStatus = "<i class='icon ion-checkmark'>";
            else
                var reportingStatus = "<i class='icon ion-close'>";

            //var details = project.toString();
            var details =
                "<i class='icon ion-android-information' /> <b>Name: </b>" + project.name +
                "<br><i class='icon ion-folder' /> <b>Dir: </b>" + project.dir +
                "<br><i class='icon ion-android-mail' /> <b>Reporting E-Mail: </b>" + project.mailAddress +
                "<br><i class='icon ion-speakerphone' /> <b>Automatic Reporting: </b>" + reportingStatus +
                "<br><i class='icon ion-cloud' /> <b>Environments</b> <span class='badge'>" + projectEnvSize + "</span>"
                    + " <a href='#' data-toggle='modal' data-target='#addProjectEnvModal' rel='tooltip' class='glyphicon glyphicon-plus' data-original-title='Add new environment' style='text-decoration: none;'></a>"
                    + Common.stringUtils.envArrayToList(project.envs, project.dir) +
                "<i class='icon ion-ios7-gear' /> <b>Custom Tasks</b> <span class='badge'>" + projectTaskSize + "</span>"
                    + " <a href='#' data-toggle='modal' data-target='#addProjectTaskModal' rel='tooltip' class='glyphicon glyphicon-plus' data-original-title='Add new task' style='text-decoration: none;'></a>"
                    + Common.stringUtils.taskArrayToList(project.tasks, project.dir);
            res.send(details);
        });
    }
};

/**
 * Save Edited File
 * @param req
 * @param res
 */
exports.saveFile = function(req, res) {
    // Get form data
    var data = req.body;
    var orgFile = data['orgFile'];
    var code = data['code'];
    var fileName = Common.path.basename(orgFile);

    // Overwrite project file
    fs.writeFileSync(orgFile, code);

    res.send({"warn": false, "message": "<strong>" + fileName + "</strong> file successfully saved"});
};

/**
 * Apply Edited File
 * @param req
 * @param res
 */
exports.applyFile = function(req, res) {
    // Get data
    var orgFile = req.body.orgFile;
    var code = req.body.code;
    var fileName = Common.path.basename(orgFile);

    // Overwrite project file
    fs.writeFileSync(orgFile, code);

    res.send({"warn": false, "message": "<strong>" + fileName + "</strong> file successfully saved"});
};

/**
 * Get Project from DB with ID
 * @param req
 * @param res
 */
exports.getProject = function(req, res) {
    var selectedId = req.query.id;

    if(selectedId === 'undefined') {
        res.send('null');
        return;
    } else {
        // Get project from DB
        Common.projectsDB.get(selectedId, function (err, project) {
            if (err) {
                console.error(err);
                res.send("There was an error getting project with ID: " + req.query.id);
                return;
            }

            // Clean result object & send
            project = Common.dbUtils.cleanResult(project);
            res.json(project);
        });
    }
}

/**
 * Get environments of selected project
 * @param req
 * @param res
 */
exports.envs = function(req, res) {
    var selectedId = req.query.id;

    if(selectedId === 'undefined') {
        res.send("ID not found!");
        return;
    } else {
        // Get project from DB
        Common.projectsDB.get(selectedId, function (err, project) {
            if (err) {
                console.error(err);
                res.send("There was an error getting project details!");
                return;
            }

            // Clean result object
            project = Common.dbUtils.cleanResult(project);
            res.send(project.envs);
        });
    }
};

/**
 * Get Project Environments as array
 * @param projectDir
 * @returns {Array}
 */
function getProjectEnvs(projectDir) {
    var projectEnvs = [];
    var configFiles = fs.readdirSync(Common.path.resolve(projectDir + '/.mage/config/environment'));
    for (var i in configFiles) {
        if (Common.path.extname(configFiles[i]) == ".yml") {
            projectEnvs.push(Common.path.basename(configFiles[i], ".yml"));
        }
    }

    return projectEnvs;
}

/**
 * Get Project Tasks as array
 * @param projectDir
 * @returns {Array}
 */
function getProjectTasks(projectDir) {
    var projectTasks = [];
    var taskPhps = fs.readdirSync(Common.path.resolve(projectDir + '/.mage/tasks'));
    for (var i in taskPhps) {
        if (Common.path.extname(taskPhps[i]) == ".php") {
            projectTasks.push(Common.path.basename(taskPhps[i], ".php"));
        }
    }

    return projectTasks;
}