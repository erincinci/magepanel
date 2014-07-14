/**
 * Module dependencies.
 */
var Common = require('./common');
var express = require('express');
var routes = require('./routes');
var mage = require('./routes/mage');
var setup = require('./routes/setup');
var http = require('http');
var path = require('path');

var app = express();

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
        title: 'Not Found'
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
app.get('/mage', mage.index); // Mage console
app.get('/mage/command', mage.command); // Execute mage command
app.get('/log', Common.scribe.express.controlPanel()); // Log control panel

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