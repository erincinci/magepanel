/*
 * GET setup page
 */
exports.index = function(req, res) {
    res.render('setup', { menu: 'setup', title: 'Application Setup' });
};