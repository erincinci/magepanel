/**
 * Created by erinci on 15.07.2014.
 */
var model = require('nodejs-model');

// Create settings model definition
module.exports = SettingsModel = model("SettingsModel")
    .attr('setupCompleted')
    .attr('cygwinBin')
    .attr('sshPageantSupport')
    .attr('mageDeployStrategy')
    .attr('mailerService')
    // Mailer - SMTP
    .attr('mailerSmtpHost')
    .attr('mailerSmtpPort')
    .attr('mailerSmtpSecure')
    .attr('mailerSmtpUser')
    .attr('mailerSmtpPass')
    // Mailer - Mandrill
    .attr('mailerMandrillApiKey')
    // Mailer - SendGrid
    .attr('mailerSendgridApiKey')
    // Mailer - AWS SES
    .attr('mailerSesAccessKeyId')
    .attr('mailerSesSecretAccessKey')
    // Mailer - sendmail
    .attr('mailerSendmailPath');

// Initialize object attributes
SettingsModel.init = function(instance) {
    instance.setupCompleted(false);
    instance.sshPageantSupport(true);
    instance.mailerService('smtp');
    instance.mailerSmtpHost('localhost');
    instance.mailerSmtpPort(25);
    instance.mailerSmtpSecure(false);
    instance.mailerSendmailPath('/usr/sbin/sendmail');
};