const nodemailer = require("nodemailer");
const expressError = require("../utils/expressError");
const EMAIL_USER = process.env.EMAIL_USER || 'customdomain.08@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'uycv cgub jkhj kmqd';


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});



module.exports = async(to, subject, text) => {
    console.log('Attempting to send email to:', to);
    
    try {
        const info = await transporter.sendMail({
            from: `"Chippin - Your only Expense Tracker" <${EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: text,
        });
        return info;
    } catch (err) {
        throw new expressError(500, "Failed to send email. Please try again.");
    }
};


