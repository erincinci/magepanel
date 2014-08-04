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

    // Save project details like environments, etc..
    var projectEnvs = [];
    var configFiles = fs.readdirSync(Common.path.resolve(project.dir() + '/.mage/config/environment'));
    for (var i in configFiles) {
        if (Common.path.extname(configFiles[i]) == ".yml") {
            console.debug("Config file: " + configFiles[i]);
            projectEnvs.push(Common.path.basename(configFiles[i], ".yml"));
        }
    }
    project.envs(projectEnvs);

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

}

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

            //var details = project.toString();
            var details =
                "<i class='icon ion-android-information' /> <b>Name: </b>" + project.name +
                "<br><i class='icon ion-folder' /> <b>Dir: </b>" + project.dir +
                "<br><i class='icon ion-cloud' /> <b>Environments</b> <span class='badge'>" + projectEnvSize + "</span>"
                    + Common.stringUtils.envArrayToList(project.envs, project.dir);
            res.send(details);
        });
    }
}

/**
 * Save Environment File
 * @param req
 * @param res
 */
exports.saveEnvFile = function(req, res) {
    // Get form data
    var data = req.body;
    var orgFile = data['orgFile'];
    var code = data['code'];

    // Overwrite environment YAML file
    fs.writeFileSync(orgFile, code);

    res.send({"warn": false, "message": "Environment file successfully saved"});
}

/**
 * Edit project
 * @param req
 * @param res
 */
exports.edit = function(req, res) {
    // TODO: Implement
}