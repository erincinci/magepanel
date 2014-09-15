/**
 * Created by erincinci on 9/14/14.
 */
var nodemailer = require('nodemailer');
var directTransport = require('nodemailer-direct-transport');

/**
 * Send Mail Using Default SMTP Server
 * @param toAddresses
 * @param subject
 * @param txtContent
 * @param htmlContent
 */
exports.sendMail = function(toAddresses, subject, txtContent, htmlContent) {
    // Create transport using direct transport
    var transporter = nodemailer.createTransport(directTransport());

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: 'no-reply@magepanel.com', // sender address
        to: toAddresses, // list of receivers
        subject: subject, // Subject line
        text: txtContent, // plaintext body
        html: htmlContent // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.error(error);
        }else{
            console.log('Mail sent: ' + info.response);
        }
    });
}