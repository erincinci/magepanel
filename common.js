/**
 * Created by erinci on 14.07.2014.
 */
var appConfig = require('./config');
var appSettings = require('user-settings').file(appConfig.setup.file);
var Datastore = require('nedb');

Common = {
    config: require('./config'),
    scribe: require('./scribe'),
    username: require('username').sync(),
    os: require('os').platform(),
    uuid: require('node-uuid'),
    settings: require('user-settings').file(appConfig.setup.file),
    SettingsModel: require('./models/settingsModel'),
    ProjectModel: require('./models/projectModel'),
    setupCompleted: appSettings.get(appConfig.setup.completed),
    projectsDB: new Datastore({ filename: 'dbs/projects.db', autoload: true })
};

module.exports = Common;