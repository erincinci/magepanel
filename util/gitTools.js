/**
 * Created by erinci on 16.01.2015.
 */
'use strict';
var path = require('path');
var getRepoInfo = require('git-repo-info');

/**
 * Check if current branch is up-to-date (Needs any pull operation)
 * @param dir
 * @param cb
 */
exports.branchUpToDate = function branchUpToDate(dir, cb) {
    // Execute fetch & status commands for checking if there's any commits to pull from remote
    require('child_process').exec('cd ' + path.resolve(__dirname, dir) + ' && git fetch && git status -b -s', function (err, stdout, stderr) {
        if (err) return cb(err.stack);

        // Get output (TODO: Somehow comes as stderr!)
        var output;
        if (stderr)
            output = stderr.trim();
        else
            output = stdout.trim();

        // Return result
        if (output.indexOf('[behind') > -1)
            cb(null, false);
        else
            cb(null, true);
    });
};

/**
 * Get revision version for the latest commit of project
 * @param dir
 * @param cb
 */
exports.revisionVersion = function revisionVersion(dir, cb) {
    require('child_process').exec('cd ' + path.resolve(__dirname, dir) + ' && git describe', function (err, stdout, stderr) {
        if (err) return cb(err.stack);

        // Get output (TODO: Somehow comes as stderr!)
        var output;
        if (stderr)
            output = stderr.trim();
        else
            output = stdout.trim();

        cb(null, output);
    });
};

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
 * Runs git checkout BRANC_NAME on project dir (ASync)
 * @param dir
 * @param branchName
 * @param cb
 */
exports.checkoutBranch = function checkoutBranch(dir, branchName, cb) {
//    require('child_process').exec('cd ' + path.resolve(__dirname, dir) + ' && git checkout -b ' + branchNameLocal + " " + branchNameRemote, function (err, stdout, stderr) {
    console.debug('cd ' + path.resolve(__dirname, dir) + ' && git checkout ' + branchName);
    require('child_process').exec('cd ' + path.resolve(__dirname, dir) + ' && git checkout ' + branchName, function (err, stdout, stderr) {
        if (err) return cb(err.stack);
        if (stderr) return cb(stderr);

        cb(null, stdout.trim());
    });
};

/**
 * Run git branch -r command on project dir (Async)
 * @param dir
 * @param cb
 */
exports.remoteBranches = function remoteBranches(dir, cb) {
    require('child_process').exec('cd ' + path.resolve(__dirname, dir) + ' && git branch -r', function (err, stdout, stderr) {
        if (err) return cb(err.stack);
        if (stderr) return cb(stderr);

        // Parse remote branch names (Exclude HEAD reference)
        var branchList = stdout.trim().split("\n");
        var branches = [];
        for(var i in branchList) {
            var branch = branchList[i].trim();
            if(branch.indexOf("->") == -1)
                branches.push(branch.replace(/origin\//g, "")); // TODO: Remote name assumes as 'origin'!
        }

        cb(null, branches);
    });
};

/**
 * Runs git command for finding current branch (Sync)
 * @param dir
 */
exports.currentBranchSync = function resolveGitBranchSync(dir) {
    //return syncExec('cd ' + path.resolve(__dirname, dir) + ' && git rev-parse --abbrev-ref HEAD', 2000);
    var repoInfo = getRepoInfo(path.join(dir, ".git"));
    if (repoInfo.sha == null) {
        console.warn("No GIT repo found at the mage path, searching parent dirs.. " + dir);
        var foundPath = require('git-repo-info')._findRepo(dir);

        if (foundPath == null) {
            console.warn("Project may not be a GIT project.. Dir: " + dir);
            return "N/A";
        }

        console.debug("Found GIT path for project.. " + foundPath);
        repoInfo = getRepoInfo(foundPath);
    }

    return repoInfo.branch;
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