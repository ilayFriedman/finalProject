var nodemailer = require('nodemailer');
module.exports = {
    sendEmail: function (destinationMail, mailSubject, mailText) {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'me.maps.system',
                    pass: 'memaps123'
                }
            });

            var mailOptions = {
                from: 'me.maps.system@gmail.com',
                to: destinationMail,
                subject: mailSubject,
                html: mailText
            };
            return [transporter,mailOptions]
    },

  };