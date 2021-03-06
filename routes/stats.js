/**
 * Module dependencies.
 */
var Common = require('../common');

/**
 * IO Get Stats
 * @param req
 */
exports.getStats = function(req) {
    // File to tail
    var fromTimestamp = req.data.from;
    var toTimestamp = req.data.to;

    // Query stats DB for given timestamp range
    Common.statsDB.find({"timestamp >": fromTimestamp, "timestamp <": toTimestamp}, function(err, stats) {
        // Handle error
        if (err) {
            console.error("Error getting stats: " + JSON.stringify(err.message));
            req.io.emit('statsCalculated', { err: "Error getting stats data from backend!", data: {} });
        }

        // Init stats object
        var statsData = Common.stats.initStatsObject();

        // Find max/min data
        statsData.numProjects = Common._.max(stats, function(stat){ return stat.numProjects; }).numProjects;
        statsData.numTags = Common._.max(stats, function(stat){ return stat.numTags; }).numTags;
        statsData.numEnvs = Common._.max(stats, function(stat){ return stat.numEnvs; }).numEnvs;
        statsData.numTasks = Common._.max(stats, function(stat){ return stat.numTasks; }).numTasks;

        // Calculate aggregated data
        var avgCounter = 0;
        statsData.avgDeployTimes = [];
        Common._.each(stats, function(stat) {
            statsData.mailsSent += stat.mailsSent;
            statsData.workflowsRun += stat.workflowsRun;
            statsData.deploysSuccess += stat.deploysSuccess;
            statsData.deploysFail += stat.deploysFail;
            statsData.rollbacks += stat.rollbacks;
            statsData.totalDeployTime += parseFloat(stat.totalDeployTime);
            if (stat.avgDeployTime > 0) {
                statsData.avgDeployTimes.push({ "date": new Date(stat.timestamp * 1000), "avg": stat.avgDeployTime });
                statsData.avgDeployTime += parseFloat(stat.avgDeployTime);
                avgCounter++;
            }
        });

        // TODO: Fix finding a cumulative moving average
        // Find average of average deploy time within give time range
        if (avgCounter > 0)
            statsData.avgDeployTime = parseFloat(statsData.avgDeployTime / avgCounter);

        // Return stats data
        req.io.emit('statsCalculated', { err: null, data: statsData });
    });
};

/**
 * Increase Workflows Run Counter
 * @param req
 */
exports.increaseWorkflowsRun = function(req) {
    Common.stats.incWorkflowsRun();
    req.io.respond({ status: 'ok' });
};

/**
 * Clear All Stats DB
 * @param req
 */
exports.clearAllStats = function(req) {
    Common.dbUtils.clearDB(Common.statsDB, function (err) {
        if (err) {
            console.error("Error clearing stats DB:", err);
            req.io.emit('statsCleared', { err: err, msg: "Error while clearing stats DB" });
        }

        console.debug("Stats DB wiped out!");
        req.io.emit('statsCleared', { err: null, msg: "Cleared stats DB!" });
    });
};