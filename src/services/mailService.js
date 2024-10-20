const e = require("express");
const transporter = require("../config/mailConfig");
const otpGenerator = require("otp-generator");
const userService = require("./userService");
const db = require("../models/index");

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
// tạo otp chỉ có số
const generateOtp = () => {
  return otpGenerator.generate(6, {
    upperCase: false,
    specialChars: false,
    alphabets: false,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars : false
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

    const check = await userService.checkUseremail(data.email);
    if (check === true) {
      const User = await db.User.findOne({
        where: {
          email: data.email,
        },
      });
      if (new Date().getTime() - User.updatedAt.getTime() < 180000) {
        resolve({
          errCode: 1,
          errMessage: "Please wait 3 minutes to get new OTP",
        });
        return;
      }
      const otp = generateOtp();
      const mailData = {
        email: data.email,
        subject: "OTP Lấy Lại Mật Khẩu",
        text: `Chào ${data.email},

Cảm ơn bạn đã tin tưởng sử dụng dịch vụ. Đây là Mã OTP lấy lại mật khẩu của bạn.

Mã xác minh: ${otp}
Lúc: ${new Date().toLocaleString()}`,
      };
      const result = await userService.saveOtp(data.email, otp);
      const mailResult = await sendMail(mailData);
      if (mailResult.accepted.length > 0) {
        
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
const feedback = async (data) => {
  return new Promise(async (resolve, reject) => {
    if (!data.email) {
      resolve({
        errCode: 1,
        errMessage: "Email is required",
      });
      return;
    }
    if(!data.fullName){
      resolve({
        errCode: 1,
        errMessage: "Fullname is required",
      });
      return;
    }
    if(!data.phoneNumber){
      resolve({
        errCode: 1,
        errMessage: "Phone number is required",
      });
      return;
    }
    if(!data.content){
      resolve({
        errCode: 1,
        errMessage: "Content is required",
      });
      return;
    }
    const mailData = {
      email: process.env.EMAIL_ADMIN,
      subject: "Feedback",
      text: `Feedback from ${data.email}
Name: ${data.fullName}
Phone number: ${data.phoneNumber}
Content: ${data.content}
      `,
    };
    const mailResult = await sendMail(mailData);
    if (mailResult.accepted.length > 0) {
      resolve({
        errCode: 0,
        message: "Feedback success",
      });
    } else {
      resolve({
        errCode: 1,
        errMessage: "Feedback fail",
      });
    }
  });
}
module.exports = {
  getOtp,
  feedback,
};
