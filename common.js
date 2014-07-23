/**
 * Created by erinci on 14.07.2014.
 */
var appConfig = require('./config');
var appSettings = require('user-settings').file(appConfig.setup.file);
var nStore = require('nstore').extend(require('nstore/query')());

Common = {
    config: require('./config'),
    scribe: require('./scribe'),
    username: require('username').sync(),
    os: require('os').platform(),
    uuid: require('node-uuid'),
    path: require('path'),
    _: require('underscore'),
    dbUtils: require('./util/dbUtils'),
    settings: require('user-settings').file(appConfig.setup.file),
    SettingsModel: require('./models/settingsModel'),
    ProjectModel: require('./models/projectModel'),
    projectsDB: nStore.new('dbs/projects.db'),
    setupCompleted: appSettings.get(appConfig.setup.completed)
};

module.exports = Common;