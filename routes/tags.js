/**
 * GET tags page
 */
var Common = require('../common');

// Vars
var settings = Common.SettingsModel.create();
var title = "Tags";

/**
 * List available tags
 * @param req
 * @param res
 */
exports.index = function(req, res) {
    // Get all tags from DB
    Common.tagsDB.all(function(err, tags) {
        if (err)
            console.error(err.message);

        res.render('tags', {
            username: Common.username,
            menu: 'tags',
            title: title,
            setupCompleted: Common.setupCompleted,
            tags: Common.dbUtils.cleanResults(tags)
        });
    });
};

/**
 * Get Tag from DB with ID
 * @param req
 * @param res
 */
exports.getTag = function(req, res) {
    var selectedId = req.query.id;

    if(selectedId === 'undefined') {
        res.send('null');
        return;
    } else {
        // Get tag from DB
        Common.tagsDB.get(selectedId, function (err, tag) {
            if (err) {
                console.error(err);
                res.send("There was an error getting tag with ID: " + req.query.id);
                return;
            }

            // Clean result object & send
            res.json(tag);
        });
    }
}

/**
 * Add new tag
 * @param req
 * @param res
 */
exports.add = function(req, res) {
    // Get form data
    var data = req.body;

    // Create tag object
    var id = Common.uuid.v1();
    var tag = Common.TagsModel.create();
    tag.id(id);
    tag.name(data['tagName']);
    tag.icon(data['tagIconName']);

    // Save new tag to DB
    Common.tagsDB.save(id, tag, function(err) {
        if (err) {
            console.error(err);
            res.send({"warn": true, "message": "Internal error while saving tag!"});
            return;
        }

        res.send({"warn": false, "message": "Tag successfully saved"});
    });
};

/**
 * Delete tag
 * @param req
 * @param res
 */
exports.delete = function(req, res) {
    var selectedId = req.query.id;

    // Delete from DB
    Common.tagsDB.remove(selectedId, function (err) {
        if (err) {
            console.error(err);
            res.send({ "warn": true, "message": "ID: " + selectedId + " not found in DB!" });
            return;
        }

        res.send({ "warn": false, "message": "Removed from DB" });
    });

};