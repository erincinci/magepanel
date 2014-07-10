/**
 * Module dependencies.
 */
var scribe = require('./scribe');
var express = require('express');
var routes = require('./routes');
var mage = require('./routes/mage');
var setup = require('./routes/setup');
var http = require('http');
var path = require('path');
var username = require('username').sync();
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
    scribe.set('mainUser', username);
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
app.get('/setup', setup.index); // App setup
app.get('/mage', mage.index); // Mage console
app.get('/mage/command', mage.command); // Execute mage command
app.get('/log', scribe.express.controlPanel()); // Log control panel

/**
 * Start Server
 */
http.createServer(app).listen(app.get('port'), function(){
  console.t().info('MagePanel started on port ' + app.get('port'));
});

// -------------------------------------------------------------------------
// TODO: DBs
// Persistent datastore with automatic loading
/*var Datastore = require('nedb')
    , db = new Datastore({ filename: 'dbs/settings.db', autoload: true });

var doc = { hello: 'world'
    , n: 5
    , today: new Date()
    , nedbIsAwesome: true
    , notthere: null
    , notToBeSaved: undefined  // Will not be saved
    , fruits: [ 'apple', 'orange', 'pear' ]
    , infos: { name: 'nedb' }
};
db.insert(doc, function (err, newDoc) {   // Callback is optional
    if (err) console.error(err);
});
// Finding all planets in the solar system
db.find({ hello: 'world' }, function (err, docs) {
    if (err) console.error(err);
    for (var i=0; i < docs.length; i++) {
        console.debug("Found doc: ", docs[i]);
    }
});*/