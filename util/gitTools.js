/**
 * Created by erinci on 16.01.2015.
 */
'use strict';
var path = require('path');
var cmd = require("cmd-exec").init();

/**
 * Runs git command for finding current branch (ASync)
 * @name resolveGitBranch
 * @param (Path) dir of the GIT project {]
 * @param {Function} cb function (err, branch) {}
 */
exports.currentBranch = function resolveGitBranch(dir, cb) {
    // http://stackoverflow.com/a/12142066/97443
    require('child_process').exec('cd ' + path.resolve(__dirname, dir) + ' && git rev-parse --abbrev-ref HEAD', function (err, stdout, stderr) {
        if (err) return cb(err.stack);
        if (stderr) return cb(stderr);

        cb(null, stdout.trim());
    });
};

/**
 * Runs git command for finding current branch (Sync)
 * @param dir
 */
exports.currentBranchSync = function resolveGitBranchSync(dir) {
    cmd.exec('cd ' + path.resolve(__dirname, dir) + ' && git rev-parse --abbrev-ref HEAD')
        .then(function(result) {
            console.debug("Found branch: " + result.message.trim());
            return result.message.trim();
        })
        .fail(function(err) {
            console.error(err.message);
        })
        .done(function() {
            // done..
        });
};

/**
 * Perform GIT pull command on project dir
 * @param dir
 * @param cb
 */
exports.pull = function performPull(dir, cb) {
    require('child_process').exec('cd ' + path.resolve(__dirname, dir) + ' && git pull', function (err, stdout, stderr) {
        if (err) return cb(err.stack);
        if (stderr) return cb(stderr);

        cb(null, stdout.trim());
    });
};