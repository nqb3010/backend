const nodemailer = require('nodemailer');

// Tạo transporter để kết nối với mail server
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // email của bạn từ biến môi trường
        pass: process.env.EMAIL_PASS   // mật khẩu email
    }
});

module.exports = transporter;