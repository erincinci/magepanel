/**
 * Created by erinci on 14.07.2014.
 */
var config = require('./config');

Common = {
    config: require('./config'),
    scribe: require('./scribe'),
    username: require('username').sync(),
    os: require('os').platform(),
    settings: require('user-settings').file(config.setup.file)
};

module.exports = Common;