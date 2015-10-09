/**
 * Created by erinci on 02.04.2015.
 */
var CronJob = require('cron').CronJob;
var _ = require('underscore');

/**
 * Stats Constructor
 * @param statsDB
 * @param tagsDB
 * @param projectsDB
 * @constructor
 */
var Stats = function(statsDB, tagsDB, projectsDB) {
    this.statsDB = statsDB;
    this.tagsDB = tagsDB;
    this.projectsDB = projectsDB;
    this.curStats = this.initStatsObject();
};

/**
 * Cron Job Prototype
 * @param interval
 */
Stats.prototype.cron = function(interval) {
    var self = this;

    // Setup CronJob
    var job = new CronJob({
        cronTime: '00 */' + interval + ' * * * *',
        onTick: function() {
            self.dumpToDB();
        },
        start: true
    });
    job.start();
};

/**
 * Dump Stats to DB
 */
Stats.prototype.dumpToDB = function() {
    var self = this;

    // Update static stats
    self.calculateStaticStats(function(err) {
        if (err)
            console.error("Error calculating static stats: " + JSON.stringify(err.message));

        // Set timestamp
        self.curStats.timestamp = (Date.now() / 1000).toFixed(0);

        // Dump to DB
        self.statsDB.save(self.curStats.timestamp, self.curStats, function(err) {
            if (err)
                console.error("Error saving stats to DB: " + JSON.stringify(err.message));

            // Clear stats object
            console.debug("Statistics dumped to DB: " + JSON.stringify(self.curStats));
            self.curStats = self.initStatsObject();
        });
    });
};

/**
 * Calculate Static Stats
 * @param callback
 */
Stats.prototype.calculateStaticStats = function(callback) {
    var self = this;
    // Get all projects from DB
    self.projectsDB.all(function(err, projects) {
        if (err)
            callback(err);

        // Calculate
        self.curStats.numProjects = _.size(projects);
        var numEnvs = 0;
        var numTasks = 0;
        _.each(projects, function(project) {
            numEnvs += _.size(project.envs);
            numTasks += _.size(project.tasks);
        });

        self.curStats.numEnvs = numEnvs;
        self.curStats.numTasks = numTasks;

        // Get all tags from DB
        self.tagsDB.all(function(err, tags) {
            if (err)
                callback(err);

            self.curStats.numTags = _.size(tags);

            // Find average deploy time
            if ((self.curStats.deploysSuccess + self.curStats.deploysFail) == 0)
                self.curStats.avgDeployTime = 0;
            else
                self.curStats.avgDeployTime = (parseFloat(self.curStats.totalDeployTime) / parseFloat((self.curStats.deploysSuccess + self.curStats.deploysFail))).toFixed(2);
            callback(null);
        });
    });
};

/**
 * Incrementer Prototypes
 */
Stats.prototype.incDeploysSuccess = function() {
    var self = this;
    self.curStats.deploysSuccess = self.curStats.deploysSuccess + 1;
};
Stats.prototype.incDeploysFail = function() {
    var self = this;
    self.curStats.deploysFail = self.curStats.deploysFail + 1;
};
Stats.prototype.incRollbacks = function() {
    var self = this;
    self.curStats.rollbacks = self.curStats.rollbacks + 1;
};
Stats.prototype.incWorkflowsRun = function() {
    var self = this;
    self.curStats.workflowsRun = self.curStats.workflowsRun + 1;
};
Stats.prototype.incMailsSent = function() {
    var self = this;
    self.curStats.mailsSent = self.curStats.mailsSent + 1;
};
Stats.prototype.addDeployTime = function(deployTimeSpent) {
    var self = this;
    self.curStats.totalDeployTime += parseFloat(deployTimeSpent);
};

/**
 * Initialize Stats JSON Object
 */
Stats.prototype.initStatsObject = function() {
    return {
        deploysSuccess: 0,
        deploysFail: 0,
        rollbacks: 0,
        workflowsRun: 0,
        mailsSent: 0,
        totalDeployTime: 0,
        avgDeployTime: 0,
        numProjects: 0,
        numEnvs: 0,
        numTasks: 0,
        numTags: 0
    };
};

module.exports = Stats;
