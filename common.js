/**
 * Created by erinci on 14.07.2014.
 */
var appConfig = require('./config.json');
var appSettings = require('user-settings').file(appConfig.setup.file);
var nStore = require('nstore').extend(require('nstore/query')());
var Stats = require('./util/stats');
var statsDBPointer = nStore.new('dbs/stats.db');

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

    // Models
    SettingsModel: require('./models/settingsModel'),
    ProjectModel: require('./models/projectModel'),
    TagsModel: require('./models/tagsModel'),

    // DBs
    statsDB: statsDBPointer,
    projectsDB: nStore.new('dbs/projects.db'),
    tagsDB: nStore.new('dbs/tags.db'),

    // Enums
    eCmdStatus: { error: 'stderr', success: 'stdout', warning: 'warning', exit: 'exit' },

    // Utils
    util: require('util'),
    timerUtil: require('./util/timerUtil'),
    mailUtils: require('./util/mailUtils'),
    dbUtils: require('./util/dbUtils'),
    stringUtils: require('./util/stringUtils'),
    stats: new Stats(statsDBPointer, nStore.new('dbs/tags.db'), nStore.new('dbs/projects.db'))
};

module.exports = Common;