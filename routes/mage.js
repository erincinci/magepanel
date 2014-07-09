/**
 * Module dependencies.
 */
var Convert = require('ansi-to-html');
var exec = require('child_process').exec;
var os = require('os').platform();
var convert = new Convert();
var config = require('../config');
var username = require('username').sync();
var title = "Mage Console";
var cygwin_pre = "chdir C:\\cygwin64\\bin\\ & bash --login -c '";
var cygwin_post = "'";

/**
 * Get mage index
 */
exports.index = function(req, res) {
    res.render('mage', {
        menu: 'mage',
        title: title,
        content: config.html.consolePointer + "Operating System: <b>" + os + "</b> | User: <b>" + username + "</b>"
    });
};

/**
 * GET mage command output
 */
exports.command = function(req, res) {
    function puts(error, stdout, stderr) {
        var output;

        if (error) {
            //console.error(error);
            output = error;
        }
        if (stderr) {
            console.warn(stderr);
            output = stderr;
        }
        if (stdout) {
            console.debug(stdout);
            output = convert.toHtml(stdout);
        }

        // Send output
        res.send(config.html.consolePointer + output);
    }

    var mageCommand = "mage " + req.query.cmd; // prepare mage command
    console.debug("Command: %s", req.query.cmd);

    // Check OS
    if (os == 'win32')
        mageCommand = cygwin_pre + mageCommand + cygwin_post;

    // Execute command
    exec(mageCommand, puts);
};