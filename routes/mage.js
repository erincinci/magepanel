/**
 * Module dependencies.
 */
var Convert = require('ansi-to-html');
var exec = require('child_process').exec;
var os = require('os').platform();
var convert = new Convert();
var username = require('username').sync();
var cygwin_pre = "chdir C:\\cygwin64\\bin\\ & bash --login -c '";
var cygwin_post = "'";

/**
 * Get mage index
 */
exports.version = function(req, res) {
    res.render('mage', { menu: 'mage', title: 'MagePHP Console', content: ">>" });
};

/**
 * GET mage version
 */
exports.version = function(req, res) {
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

        // Write output
        console.t().info("OS: %s | User: %s", os, username);
        res.render('mage', { menu: 'mage', title: 'MagePHP Console', content: output });
    }

    var cmd = "mage version";
    if (os == 'win32') cmd = cygwin_pre + cmd + cygwin_post;
    exec(cmd, puts);
};