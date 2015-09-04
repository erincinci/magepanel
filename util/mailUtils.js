/**
 * Created by erincinci on 9/14/14.
 */
var config = require('../config');
var Common = require('../common');
var nodemailer = require('nodemailer');
var jade = require('jade');

/**
 * Send Mail Using Default SMTP Server - Internal Function
 * @param reqIo
 * @param toAddresses
 * @param subject
 * @param txtContent
 * @param htmlContent
 */
function sendMail(reqIo, toAddresses, subject, txtContent, htmlContent) {
    // TODO: Create transport based on mailer type (Common.settings.get("mailerService"))
    // Create transport
    var transporter = nodemailer.createTransport({
        service: config.mailer.service,
        auth: {
            host: config.mailer.host,
            port: config.mailer.port,
            secure: config.mailer.secure,
            user: config.mailer.authUser,
            pass: config.mailer.authPass
        }
    });

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: config.mailer.fromAddress, // sender address
        to: toAddresses, // list of receivers
        subject: subject, // Subject line
        text: txtContent, // plaintext body
        html: htmlContent // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error) {
            console.error(error);
            reqIo.emit('cmdResponse', { result: error, status: 'stderr' });
        } else {
            var msg = 'Report mail successfully sent to ' + toAddresses + ' : ' + info.response;
            console.log(msg);
            reqIo.emit('cmdResponse', { result: msg, status: 'stdout' });
        }
    });
}

/**
 * Send Successful Deploy Report Mail
 * @param reqIo
 * @param toAddresses
 * @param project
 * @param environment
 * @param releaseId
 * @param user
 * @param dateTime
 * @param consoleLog
 */
exports.sendSuccessMail = function(reqIo, toAddresses, project, environment, releaseId, user, dateTime, consoleLog) {
    // Render mail content using Jade Engine
    var htmlContent = jade.renderFile(__dirname + '/mail-templates/deploy-report.jade', {
        pretty: true,
        project: project,
        environment: environment,
        releaseId: releaseId,
        user: user,
        dateTime: dateTime,
        consoleLog: consoleLog
    });

    // Send report mail
    return sendMail(reqIo, toAddresses, "MagePanel Deploy Report", '', htmlContent);
};