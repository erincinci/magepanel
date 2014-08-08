/**
 * Module dependencies.
 */
var Common = require('./common');
var express = require('express.io');
var routes = require('./routes');
var projects = require('./routes/projects');
var mage = require('./routes/mage');
var setup = require('./routes/setup');
var http = require('http');
var path = require('path');

var app = express().http().io();

/**
 * Logger Configuration
 */
Common.scribe.configure(function(){
    Common.scribe.set('app', Common.config.server.name);
    Common.scribe.set('logPath', Common.config.logger.directory);
    Common.scribe.set('defaultTag', Common.config.logger.defaultTag);
    Common.scribe.set('divider', Common.config.logger.divider);
    Common.scribe.set('identation', 5);
    Common.scribe.set('maxTagLength', 30);
    Common.scribe.set('mainUser', Common.username);
});
// Create loggers (name, save to file, print to console, tag color)
Common.scribe.addLogger('debug', true , true, 'grey');
Common.scribe.addLogger('log', true , true, 'white');
Common.scribe.addLogger('info', true , true, 'green');
Common.scribe.addLogger('error', true , true, 'red');
Common.scribe.addLogger('warn', true , true, 'yellow');

/**
 * Express Server Configuration
 */
app.set('port', process.env.PORT || Common.config.server.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(express.favicon());
app.use(express.favicon(path.join(__dirname, 'public','images','favicon.ico')));
//app.use(express.logger('dev')); // Open for express js logging
app.use(express.json());
app.use(express.urlencoded());
//app.use(express.methodOverride()); //deprecated
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// 404
app.use(function(req, res, next) {
    console.warn("404: %s", req.url);
    res.status(404);
    res.render('404', {
        username: Common.username,
        title: 'Not Found',
        setupCompleted: Common.setupCompleted
    });
});

// development only
if (app.get('env') == 'development') {
  app.use(express.errorHandler());
}

/**
 * Routes
 */
app.get('/', routes.index); // Index

app.get('/setup', setup.index); // App setup
app.post('/setup/save', setup.save); // Setup save

app.get('/projects', projects.index); // Projects page
app.post('/projects/add', projects.add); // Add new project
app.post('/projects/refresh', projects.refresh); // Refresh project
app.post('/projects/delete', projects.delete); // Delete projects
app.post('/projects/saveFile', projects.saveFile); // Save project file
app.get('/projects/detail', projects.detail); // Get project detail
app.get('/projects/envs', projects.envs); // Get environments of selected project

app.get('/mage', mage.index); // Mage console
app.io.route('mageCommand', mage.command); // Execute mage command with Socket.IO

app.get('/log', Common.scribe.express.controlPanel()); // Log control panel

/**
 * Start Server
 */
app.listen(app.get('port'), function(){
  console.t().info('MagePanel started on port ' + app.get('port'));
});