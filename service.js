var Common = require('./common');
var Service = null;

/**
 * Service Manager (OS Dependent)
 */
if (Common.os == 'win32') {
    // Windows
    Service = require('node-windows').Service;
} else if (Common.os == 'darwin') {
    // Mac OS
    Service = require('node-mac').Service;
} else {
    // Linux
    Service = require('node-linux').Service;
}

// Create a new service object
var svc = new Service({
    name: 'MagePanel',
    description: 'UI for MagePHP Deployment Tool',
    script: 'app.js'
});

// Listen for service events
svc.on('install',function() {
    console.log("MagePanel service installed.");
    svc.start();
});
svc.on('alreadyinstalled',function() {
    console.log("MagePanel service already installed!");
});
svc.on('invalidinstallation',function() {
    console.log("MagePanel service invalid installation!");
});
svc.on('uninstall',function() {
    console.log("MagePanel service uninstalled.");
});
svc.on('start',function() {
    console.log("MagePanel service started.");
});
svc.on('stop',function() {
    console.log("MagePanel service stopped.");
});
svc.on('error',function(err) {
    console.log("MagePanel service error: ", err);
});

if (! svc.exists) {
    // Install service if not installed
    svc.install();
} else {
    // TODO: Restart if installed already
    //svc.restart();
    svc.uninstall();
    svc.install();
}