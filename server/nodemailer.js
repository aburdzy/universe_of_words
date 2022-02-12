const nodemailer = require("nodemailer");

async function sendMail (receiver, subject, text, html) {  
    const sentMail = await new Promise((resolve, reject) => {
        transporter.sendMail({ from: process.env.MAIL, to: receiver, subject, text, html }, function(error, info) {
        if (error) reject(error);
        resolve(info);
      });
    });
  
    return sentMail;
}

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_PASSWORD
    }
});

module.exports = sendMail;