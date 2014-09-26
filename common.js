/**
 * Created by erinci on 14.07.2014.
 */
var appConfig = require('./config.json');
var appSettings = require('user-settings').file(appConfig.setup.file);
var nStore = require('nstore').extend(require('nstore/query')());

Common = {
    // Locals
    config: require('./config'),
    scribe: require('./scribe'),
    settings: require('user-settings').file(appConfig.setup.file),
    setupCompleted: appSettings.get(appConfig.setup.completed),

    // Tools
    S: require('string'),
    username: require('username').sync(),
    os: require('os').platform(),
    uuid: require('node-uuid'),
    ip: require('ip'),
    path: require('path'),
    validator: require('validator'),
    _: require('underscore'),

    // Utils
    mailUtils: require('./util/mailUtils'),
    dbUtils: require('./util/dbUtils'),
    stringUtils: require('./util/stringUtils'),

    // Models
    SettingsModel: require('./models/settingsModel'),
    ProjectModel: require('./models/projectModel'),

    // DBs
    projectsDB: nStore.new('dbs/projects.db'),

    // Enums
    eCmdStatus: { error: 'stderr', success: 'stdout', warning: 'warning', exit: 'exit' }
};

module.exports = Common;