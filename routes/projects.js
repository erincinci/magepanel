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
    res.render('projects', {
        username: Common.username,
        menu: 'projects',
        title: title,
        setupCompleted: Common.setupCompleted
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
    var project = Common.ProjectModel.create();
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
    Common.projectsDB.save(Common.uuid.v1(), project, function(err) {
        if (err) {
            console.error(err);
            res.send({"warn": true, "message": "Internal error while adding project!"});
            return;
        }
    });

    res.send({"warn": false, "message": "Project successfully added"});
};