const db = require("../models/index");
const bcrypt = require("bcrypt");
const CommonUtils = require("../utils/commonUtils");
const { access } = require("fs");

const filterEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

const checkUseremail = async (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await db.User.findOne({ where: { email } });
      if (user) {
        resolve(true);
      }
      resolve(false);
    } catch (error) {
      resolve(false);
    }
  });
};
const register = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email) {
        resolve({
          errCode: 1,
          errMessage: "Email is required",
        });
        return;
      }

      if (!data.password) {
        resolve({
          errCode: 1,
          errMessage: "Password is required",
        });
        return;
      }

      if (!data.confirmPassword) {
        resolve({
          errCode: 1,
          errMessage: "Confirm password is required",
        });
        return;
      }
      if (data.password.length < 6) {
        resolve({
          errCode: 1,
          errMessage: "Password must be at least 6 characters",
        });
        return;
      }
      if (!data.firstName) {
        resolve({
          errCode: 1,
          errMessage: "First name is required",
        });
        return;
      }
      if (!data.lastName) {
        resolve({
          errCode: 1,
          errMessage: "Last name is required",
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
      if (data.password !== data.confirmPassword) {
        resolve({
          errCode: 1,
          errMessage: "Passwords do not match",
        });
        return;
      }
      const check = await checkUseremail(data.email);
      if (check === true) {
        resolve({
          errCode: 1,
          errMessage: "Email already exists",
        });
        return;
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
      const newUser = await db.User.create({
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        amount: 0,
        currency: "VND",
        avatar : "https://www.vietnamworks.com/hrinsider/wp-content/uploads/2023/12/anh-den-ngau.jpeg",
      });
      resolve({
        errCode: 0,
        errMessage: "OK",
        user: newUser.email,
      });
    } catch (error) {
      resolve({
        errCode: 1,
        errMessage: "Something went wrong",
      });
    }
  });
};
const login = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email || !data.password) {
        resolve({
          errCode: 1,
          errMessage: "Email and password are required",
        });
      }
      if(!data.email) {
        resolve({
          errCode: 1,
          errMessage: "Email is required",
        });
        return;
      }
      if (!data.password) {
        resolve({
          errCode: 1,
          errMessage: "Password is required",
        });
        return;
      }
      if(!filterEmail.test(data.email)) {
        resolve({
          errCode: 1,
          errMessage: "Email is invalid",
        });
        return;
      }
      const userExists = await checkUseremail(data.email);
      if (userExists === true) {
        const user = await db.User.findOne({ where: { email: data.email } });
        const checkPassword = await bcrypt.compare(
          data.password,
          user.password
        );
        if (checkPassword === true) {
          const token = CommonUtils.encodeToken(user.email);
          console.log(data);
          delete user.password;
          console.log(user);
          resolve({
            errCode: 0,
            errMessage: "OK",
            accessToken: token,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            amount: user.amount,
            currency: user.currency,
            avatar: user.avatar,
          });
        }
        resolve({
          errCode: 1,
          errMessage: "Password is incorrect",
        });
      }
      resolve({
        errCode: 1,
        errMessage: "Email does not exist",
      });
    } catch (error) {
      resolve({
        errCode: 1,
        errMessage: "Something went wrong",
      });
    }
  });
};
const changePassword = async (data, usertoken) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (data.email === usertoken.email) {
        if(!data.email) {
          resolve({
            errCode: 1,
            errMessage: "Email is required",
          });
          return;
        }
        if (!data.oldPassword) {
          resolve({
            errCode: 1,
            errMessage: "Old password is required",
          });
          return;
        }
        if (!data.newPassword) {
          resolve({
            errCode: 1,
            errMessage: "New password is required",
          });
          return;
        }
        if (!data.confirmPassword) {
          resolve({
            errCode: 1,
            errMessage: "Confirm password is required",
          });
          return;
        }
        if (data.newPassword.length < 6) {
          resolve({
            errCode: 1,
            errMessage: "Password must be at least 6 characters",
          });
          return;
        }
        if (data.newPassword !== data.confirmPassword) {
          resolve({
            errCode: 1,
            errMessage: "Passwords do not match",
          });
        }
        if(data.oldPassword === data.newPassword) {
          resolve({
            errCode: 1,
            errMessage: "New password must be different from old password",
          });
        }
        const check = await checkUseremail(usertoken.email);
        if (check === true) {
          const user = await db.User.findOne({ where: { email: data.email } });
          const checkPassword = await bcrypt.compare(
            data.oldPassword,
            user.password
          );
          if (checkPassword) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(data.newPassword, salt);
            await db.User.update(
              { password: hashedPassword },
              { where: { email: data.email } }
            );
            resolve({
              errCode: 0,
              errMessage: "OK",
            });
          }
          resolve({
            errCode: 1,
            errMessage: "Old password is incorrect",
          });
        }
        resolve({
          errCode: 1,
          errMessage: "Email does not exist",
        });
      }
      resolve({
        errCode: 1,
        errMessage: "Unauthorized access",
      });
    } catch (error) {
      console.log(error);
      resolve({
        errCode: 1,
        errMessage: "Something went wrong",
      });
    }
  });
};

module.exports = {
  login,
  register,
  changePassword,
};
