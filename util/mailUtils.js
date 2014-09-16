/**
 * Created by erincinci on 9/14/14.
 */
var Common = require('../common');
var nodemailer = require('nodemailer');
var jade = require('jade');

/**
 * Send Mail Using Default SMTP Server
 * @param toAddresses
 * @param subject
 * @param txtContent
 * @param htmlContent
 */
function sendMail(toAddresses, subject, txtContent, htmlContent) {
    // Create transport
    var transporter = nodemailer.createTransport({
        service: Common.config.mailer.service,
        auth: {
            host: Common.config.mailer.host,
            port: Common.config.mailer.port,
            secure: Common.config.mailer.secure,
            user: Common.config.mailer.authUser,
            pass: Common.config.mailer.authPass
        }
    });

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: Common.config.mailer.fromAddress, // sender address
        to: toAddresses, // list of receivers
        subject: subject, // Subject line
        text: txtContent, // plaintext body
        html: htmlContent // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error) {
            console.error(error);
        } else {
            console.log('Mail sent to ' + toAddresses + ' : ' + info.response);
        }
    });
}

/**
 * Send Successful Deploy Report Mail
 * @param toAddresses
 * @param project
 * @param environment
 * @param releaseId
 * @param user
 * @param dateTime
 * @param consoleLog
 */
exports.sendSuccessMail = function(toAddresses, project, environment, releaseId, user, dateTime, consoleLog) {
    // Render mail content using Jade Engine
    var htmlContent = jade.renderFile(__dirname + '/mail-templates/deploy-report.jade', {
        pretty: true,
        locals: {
            project: project,
            environment: environment,
            releaseId: releaseId,
            user: user,
            dateTime: dateTime,
            consoleLog: consoleLog
        }
    });
    console.debug(htmlContent);

    // TODO: Send report mail
    //sendMail(toAddresses, "MagePanel Deploy Report", '', htmlContent);
}