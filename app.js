/**
 * Module dependencies.
 */
var scribe = require('./scribe');
var express = require('express');
var routes = require('./routes');
var mage = require('./routes/mage');
var http = require('http');
var path = require('path');
var config = require('./config');

var app = express();

/**
 * Logger Configuration
 */
scribe.configure(function(){
    scribe.set('app', config.server.name);
    scribe.set('logPath', config.logger.directory);
    scribe.set('defaultTag', config.logger.defaultTag);
    scribe.set('divider', config.logger.divider);
    scribe.set('identation', 5);
    scribe.set('maxTagLength', 30);
    scribe.set('mainUser', config.logger.user);
});
// Create loggers (name, save to file, print to console, tag color)
scribe.addLogger('debug', true , true, 'grey');
scribe.addLogger('log', true , true, 'white');
scribe.addLogger('info', true , true, 'green');
scribe.addLogger('error', true , true, 'red');
scribe.addLogger('warn', true , true, 'yellow');

/**
 * Express Server Configuration
 */
app.set('port', process.env.PORT || config.server.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(express.favicon());
app.use(express.favicon(path.join(__dirname, 'public','images','favicon.ico')));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
//app.use(express.methodOverride()); //deprecated
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if (app.get('env') == 'development') {
  app.use(express.errorHandler());
}

/**
 * Routes
 */
app.get('/', routes.index); // Index
app.get('/version', mage.version); // Mage version
app.get('/log', scribe.express.controlPanel()); // Log control panel

/**
 * Start Server
 */
http.createServer(app).listen(app.get('port'), function(){
  console.t().info('MagePanel started on port ' + app.get('port'));
});