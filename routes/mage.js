/**
 * Module dependencies.
 */
var Common = require('../common');
var Convert = require('ansi-to-html');
var exec = require('child_process').exec;
var convert = new Convert();

// Vars
var title = "Console";
var cygwin_pre = "chdir C:\\cygwin64\\bin\\ & bash --login -c '";
var cygwin_post = "'";

/**
 * Get mage index
 */
exports.index = function(req, res) {
    res.render('mage', {
        username: Common.username,
        menu: 'mage',
        title: title,
        content: Common.config.html.consolePointer + "Operating System: <b>" + Common.os + "</b> | User: <b>" + Common.username + "</b>"
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
        res.send(Common.config.html.consolePointer + output);
    }

    var mageCommand = "mage " + req.query.cmd; // prepare mage command

    // Check OS
    if (Common.os == 'win32')
        mageCommand = cygwin_pre + mageCommand + cygwin_post;

    // Execute command
    exec(mageCommand, puts);
};