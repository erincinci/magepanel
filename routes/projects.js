/**
 * Module dependencies.
 */
var Common = require('../common');
var fs = require('fs');

// Vars
var settings = Common.SettingsModel.create();
var title = "Projects";

/**
 * Get projects index
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
            projects: projects
        });
    });
};

/**
 * Add project
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

    // Add project to DB
    Common.projectsDB.save(id, project, function(err) {
        if (err) {
            console.error(err);
            res.send({"warn": true, "message": "Internal error while adding project!"});
            return;
        }
    });

    res.send({"warn": false, "message": "Project successfully added"});
};

/**
 * Delete project
 */
exports.delete = function(req, res) {
    var selectedId = req.query.id;

    // TODO: Implement
    res.send({ "warn": false, "message": selectedId });
}

/**
 * Get project detail
 */
exports.detail = function(req, res) {
    // TODO: Implement
    if(req.query.id === 'undefined')
        res.send("ID not found!");
    else
        res.send(req.query.id);
}