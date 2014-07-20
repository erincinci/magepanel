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
        // TODO: Gives "Can't set headers after they are sent" exception
        res.send({"warn": true, "message": "Mage directory not found in the path!"});
    }

    // TODO: Check if projects already exists in DB

    // Create project object
    var project = Common.ProjectModel.create();
    project.id(Common.uuid.v1());
    project.dir(data['projectDir']);
    project.name(data['projectName']);

    // Add project to DB
    Common.projectsDB.insert(project, function (err, newDoc) {
        if (err) {
            console.error(err);
            res.send({"warn": true, "message": "Internal error while creating project!"});
        }
    });

    // TODO: DEBUG
    Common.projectsDB.find({}, function (err, projects) {
        if (err)
        console.error(err);

        for (var i=0; i < projects.length; i++) {
            console.debug("Found project: ", projects[i]);
        }
    });

    res.send({"warn": false, "message": "Project successfully added"});
};