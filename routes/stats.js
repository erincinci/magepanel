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
        Common._.each(stats, function(stat) {
            statsData.mailsSent += stat.mailsSent;
            statsData.workflowsRun += stat.workflowsRun;
        });

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