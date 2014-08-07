/**
 * Module dependencies.
 */
var Common = require('../common');
var fs = require('fs');
var tempWrite = require('../util/temp-write');

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

        res.send({"warn": false, "message": "Project successfully added"});
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
            project.dir = project.dir.replace(/\\/g, "\\\\"); // TODO: Casues multiple backslashes !!!

            // Create refreshed project
            var refreshedProject = Common.ProjectModel.create();
            refreshedProject.id(project.id);
            refreshedProject.dir(project.dir);
            refreshedProject.name(project.name);
            refreshedProject.envs(getProjectEnvs(project.dir));
            refreshedProject.tasks(getProjectTasks(project.dir));

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

            //var details = project.toString();
            var details =
                "<i class='icon ion-android-information' /> <b>Name: </b>" + project.name +
                "<br><i class='icon ion-folder' /> <b>Dir: </b>" + project.dir +
                "<br><i class='icon ion-cloud' /> <b>Environments</b> <span class='badge'>" + projectEnvSize + "</span>"
                    + " <a href='javascript:void(0);' rel='tooltip' class='glyphicon glyphicon-plus' data-original-title='Add new environment' style='text-decoration: none;'></a>"
                    + Common.stringUtils.envArrayToList(project.envs, project.dir) +
                "<i class='icon ion-ios7-gear' /> <b>Custom Tasks</b> <span class='badge'>" + projectTaskSize + "</span>"
                    + " <a href='javascript:void(0);' rel='tooltip' class='glyphicon glyphicon-plus' data-original-title='Add new task' style='text-decoration: none;'></a>"
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

    // Overwrite environment YAML file
    fs.writeFileSync(orgFile, code);

    res.send({"warn": false, "message": "<strong>" + fileName + "</strong> file successfully saved"});
};

/**
 * Edit project
 * @param req
 * @param res
 */
exports.edit = function(req, res) {
    // TODO: Implement project edit functionality
}

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
};

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
};

