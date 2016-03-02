/**
 * Created by erincinci on 9/14/14.
 */
var config = require('../config');
var Common = require('../common');
var validator = require('validator');
var jade = require('jade');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var mandrillTransport = require('nodemailer-mandrill-transport');
var sendgridTransport = require('nodemailer-sendgrid-transport');
var sesTransport = require('nodemailer-ses-transport');
var sendmailTransport = require('nodemailer-sendmail-transport');

// Monitoring
var rollbar = require('rollbar');
rollbar.init(config.rollbar.serverKey, { codeVersion: config.version });

/**
 * Validate list of email addresses (Comma seperated)
 * @param emailsStr
 * @returns {string}
 */
exports.validateMailAddresses = function(emailsStr) {
    var mailValidationError = null;

    // Seperate emails string
    var emailsList = emailsStr.split(',');

    // Check if there's any email defined
    if (emailsList.length == 0)
        mailValidationError = "No emails defined for reporting!";
    else {
        // Validate each email in list
        emailsList.forEach(function(email) {
            if (! validator.isEmail(email.trim())) {
                mailValidationError = "Email address is not valid: " + email;
                console.warn(mailValidationError);
            }
        });
    }

    return mailValidationError;
};

/**
 * Send Mail Using Default SMTP Server - Internal Function
 * @param reqIo
 * @param toAddresses
 * @param subject
 * @param txtContent
 * @param htmlContent
 */
function sendMail(reqIo, toAddresses, subject, txtContent, htmlContent) {
    // Init mailer transporter
    var userSettings = require('user-settings').file(config.setup.file);
    var transporterSet = initMailerTransporter(userSettings.get("mailerService"), userSettings);

    // Check if there's any errors
    if (transporterSet.err == null && transporterSet.transporter) {
        // Setup e-mail data with unicode symbols
        var mailOptions = {
            from: config.mailer.fromAddress, // sender address
            to: toAddresses, // list of receivers
            subject: subject, // Subject line
            text: txtContent, // plaintext body
            html: htmlContent // html body
        };

        // Send mail with defined transport object
        transporterSet.transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                // Log as a warning to rollbar
                rollbar.handleErrorWithPayloadData(error, {level: 'warning', custom: mailOptions, environment: Common.env});

                console.error(error);
                var mailerErrMsg = config.html.consolePointerWarn + "Error sending report email(s): " + error.message + "<br>";
                reqIo.emit('cmdResponse', { result: mailerErrMsg, status: 'warning' });
            } else {
                var msg = 'Report mail(s) successfully sent to ' + JSON.stringify(toAddresses);
                console.log(msg + " : " + JSON.stringify(info));
                var mailerSucMsg = config.html.consolePointer + msg + "<br>";
                reqIo.emit('cmdResponse', { result: mailerSucMsg, status: 'stdout' });
            }
        });
    } else {
        console.error("Error sending mail: " + transporterSet.err.message);
        reqIo.emit('cmdResponse', { result: transporterSet.err.message, status: 'warning' });
    }
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

/**
 * Initialize Mailer Transporter
 * @param mailerService
 * @param opt
 * @returns {{err, transporter}}
 */
function initMailerTransporter(mailerService, opt) {
    var transporter;
    var mailErr = null;

    // Create transporter according to mailer service
    switch (mailerService) {
        case 'smtp':
            // SMTP - Check options & Create transporter
            if (opt.get("mailerSmtpHost") && opt.get("mailerSmtpPort"))
                transporter = nodemailer.createTransport(smtpTransport({
                    host: opt.get("mailerSmtpHost"),
                    port: opt.get("mailerSmtpPort"),
                    secure: opt.get("mailerSmtpSecure"),
                    auth: {
                        user: opt.get("mailerSmtpUser") || '',
                        pass: opt.get("mailerSmtpPass") || ''
                    }
                }));
            else
                mailErr = new Error("Some SMTP mailer settings are missing!");
            break;
        case 'mandrill':
            // Mandrill - Check options & Create transporter
            if (opt.get("mailerMandrillApiKey"))
                transporter = nodemailer.createTransport(mandrillTransport({
                    auth: {
                        apiKey: opt.get("mailerMandrillApiKey")
                    }
                }));
            else
                mailErr = new Error("Error sending mail: Mandrill API key is missing!");
            break;
        case 'sendgrid':
            // SendGrid - Check options & Create transporter
            if (opt.get("mailerSendgridApiKey"))
                transporter = nodemailer.createTransport(sendgridTransport({
                    auth: {
                        api_key: opt.get("mailerSendgridApiKey")
                    }
                }));
            else
                mailErr = new Error("Error sending mail: SendGrid API key is missing!");
            break;
        case 'ses':
            // AWS SES - Check options & Create transporter
            if (opt.get("mailerSesAccessKeyId") && opt.get("mailerSesSecretAccessKey"))
                transporter = nodemailer.createTransport(sesTransport({
                    accessKeyId: opt.get("mailerSesAccessKeyId"),
                    secretAccessKey: opt.get("mailerSesSecretAccessKey")
                }));
            else
                mailErr = new Error("AWS SES mailer options are missing!");
            break;
        case 'sendmail':
            // Sendmail - Check options & Create transporter
            if (opt.get("mailerSendmailPath"))
                transporter = nodemailer.createTransport(sendmailTransport({
                    path: opt.get("mailerSendmailPath")
                }));
            else
                mailErr = new Error("Error sending mail: Sendmail path is missing!");
            break;
        default:
            mailErr = new Error("Mailer option not set, canceling send mail operation..");
            break;
    }

    return {err: mailErr, transporter: transporter};
}