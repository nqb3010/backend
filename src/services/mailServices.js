const e = require("express");
const transporter = require("../config/mailConfig");
const otpGenerator = require("otp-generator");
const userServices = require("../services/userServices");

const filterEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

const sendMail = (data) => {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: `"Admin" <${process.env.EMAIL_USER}>`,
      to: data.email,
      subject: data.subject,
      text: data.text,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        resolve(error);
      } else {
        resolve(info);
      }
    });
  });
};
// generate otp number
const generateOtp = () => {
  return otpGenerator.generate(6, {
    upperCase: false,
    specialChars: false,
    alphabets: false,
  });
};

const getOtp = async (data) => {
  return new Promise(async (resolve, reject) => {
    if (!data.email) {
      resolve({
        errCode: 1,
        errMessage: "Email is required",
      });
      return;
    }
    if (!filterEmail.test(data.email)) {
      resolve({
        errCode: 1,
        errMessage: "Email is invalid",
      });
      return;
    }
    const check = await userServices.checkUseremail(data.email);
    if (check === true) {
      const otp = generateOtp();
      const mailData = {
        email: data.email,
        subject: "OTP Lấy Lại Mật Khẩu",
        text: `Chào ${data.email},

Cảm ơn bạn đã tin tưởng sử dụng dịch vụ. Đây là Mã OTP lấy lại mật khẩu của bạn.

Mã xác minh: ${otp}
Lúc: ${new Date().toLocaleString()}`,
      };
      const mailResult = await sendMail(mailData);
      if (mailResult.accepted.length > 0) {
        const result = await userServices.saveOtp(data.email, otp);
        resolve(result);
      } else {
        resolve({
          errCode: 1,
          errMessage: "Email not found",
        });
      }
    } else {
      resolve({
        errCode: 1,
        errMessage: "Email not found",
      });
    }
  });
};

module.exports = {
  getOtp,
};
