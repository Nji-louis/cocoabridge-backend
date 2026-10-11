const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'server900.web-hosting.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendNewsletterEmail = async (to, subject, html) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
    });
};

module.exports = sendNewsletterEmail;
