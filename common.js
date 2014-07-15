/**
 * Created by erinci on 14.07.2014.
 */
var appConfig = require('./config');
var appSettings = require('user-settings').file(appConfig.setup.file);

Common = {
    config: require('./config'),
    scribe: require('./scribe'),
    username: require('username').sync(),
    os: require('os').platform(),
    settings: require('user-settings').file(appConfig.setup.file),
    SettingsModel: require('./models/settingsModel'),
    setupCompleted: appSettings.get(appConfig.setup.completed)
};

module.exports = Common;