'use strict';
//var Common = require('../common');
var path = require('path');
var tmpdir = 'public/tmp';
var fs = require('graceful-fs');
var mkdirp = require('mkdirp');
var uuid = require('node-uuid');
var rimraf = require('rimraf');

function tempfile(filepath) {
	//return path.join(tmpdir, uuid.v4(), (filepath || ''));
    var filename = Common.path.basename(filepath);
    return path.join(tmpdir, uuid.v4(), filename);
}

module.exports = function (str, filepath, cb) {
	if (typeof filepath === 'function') {
		cb = filepath;
		filepath = null;
	}

	var fullpath = tempfile(filepath);

	mkdirp(path.dirname(fullpath), function (mkdirErr) {
        if (mkdirErr)
            cb(mkdirErr, fullpath);
        else {
            fs.writeFile(fullpath, str, function (writeErr) {
                cb(writeErr, fullpath);
            });
        }
	});
};

module.exports.sync = function (str, filepath) {
	var fullpath = tempfile(filepath);

	mkdirp.sync(path.dirname(fullpath));
	fs.writeFileSync(fullpath, str);

	return fullpath;
};

module.exports.cleanTmp = function() {
    var files;
    try {
        files = fs.readdirSync(tmpdir);
    } catch(e) {
        return;

    }
    if (files.length > 0) {
        for (var i = 0; i < files.length; i++) {
            // If file is gitignore continue
            if (files[i] == '.gitignore')
                continue;

            var filePath = tmpdir + '/' + files[i];
            if (fs.statSync(filePath).isFile())
                fs.unlinkSync(filePath);
            else
                rimraf.sync(filePath);
        }
    }
};
