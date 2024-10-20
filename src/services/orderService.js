const { logger } = require("sequelize/lib/utils/logger");
const db = require("../models/index");
const uuid = require("uuid");
const { raw } = require("body-parser");
const { sep } = require("path");
require("dotenv").config();
const moment = require("moment-timezone");
const crypto = require("crypto");
var querystring = require("qs");
const { log } = require("console");
const { stat } = require("fs");
const e = require("express");

createOrder = async (data, user) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await db.User.findOne({
        where: {
          email: user,
        },
      });
      if (checkUser === null) {
        resolve({
          errCode: 1,
          errMessage: "Người dùng không tồn tại",
        });
        return;
      }

      const checkCart = await db.Cart.findAll({
        where: {
          user_id: checkUser.id,
        },
      });
      if (checkCart.length === 0) {
        resolve({
          errCode: 1,
          errMessage: "Giỏ hàng trống",
        });
        return;
      }

      const CheckPrice = await db.Cart.findAll({
        where: {
          user_id: checkUser.id,
        },
        attributes: [
          "id",
          "quantity",
          [
            db.sequelize.literal(`
                      CAST(
                        SUM(
                          CASE
                            WHEN Product.discount > 0
                            THEN quantity * (Product.price - (Product.price * Product.discount / 100))
                            ELSE quantity * Product.price
                          END
                        ) AS INTEGER
                      )
                    `),
            "total_price",
          ],
        ],
        include: [
          {
            model: db.Product,
            as: "product",
            attributes: [
              "id",
              "name",
              "price",
              "discount",
              [
                db.sequelize.literal(`
                          CASE
                            WHEN discount > 0
                            THEN CAST(price - (price * discount / 100) AS INTEGER)
                            ELSE NULL
                          END
                        `),
                "discounted_price",
              ],
            ],
          },
          {
            model: db.Size,
            as: "size",
            attributes: ["id"],
          },
        ],
        group: ["Cart.id", "product.id"],
        raw: true,
        nest: true,
      });

      const grandTotal = CheckPrice.reduce(
        (acc, item) => acc + item.total_price,
        0
      );

      let addr_id = null;

      // Kiểm tra nếu địa chỉ không được nhập vào
      if (!data.address || !data.phone || !data.name) {
        const checkaddr = await db.Address.findOne({
          where: {
            user_id: checkUser.id,
            default: 1,
          },
        });
        if (checkaddr === null) {
          resolve({
            errCode: 1,
            errMessage: "Địa chỉ không được để trống",
          });
          return;
        }
      } else {
        const checkaddr = await db.Address.findAll({
          where: {
            user_id: checkUser.id,
          },
        });
        if (checkaddr.length > 0) {
        const insertAddress = await db.Address.create({
          user_id: checkUser.id,
          address: data.address,
          phone: data.phone,
          name: data.name,
          default: 0,
        });
        addr_id = insertAddress.id;
      } else {
        const insertAddress = await db.Address.create({
          user_id: checkUser.id,
          address: data.address,
          phone: data.phone,
          name: data.name,
          default: 1,
        });
        addr_id = insertAddress.id;
      }
      }

      // Tạo đơn hàng
      const order = await db.Order.create({
        id: uuid.v4(),
        user_id: checkUser.id,
        address: data.address,
        phone: data.phone,
        name: data.name,
        total: grandTotal,
        addr_id: addr_id, // Sử dụng addr_id chính xác
      });

      // Tạo chi tiết đơn hàng
      const orderDetail = CheckPrice.map((item) => {
        return {
          order_id: order.id,
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.total_price,
          discount: item.product.discount,
          size_id: item.size.id,
        };
      });
      await db.OrderDetail.bulkCreate(orderDetail);

      // Xóa giỏ hàng
      await db.Cart.destroy({
        where: {
          user_id: checkUser.id,
        },
      });

      resolve({
        errCode: 0,
        errMessage: "Đã tạo đơn hàng thành công",
        orderId: order.id,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getOrders = async (user) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await db.User.findOne({
        where: {
          email: user,
        },
      });
      if (checkUser === null) {
        resolve({
          errCode: 1,
          errMessage: "Người dùng không tồn tại",
        });
        return;
      }
      const order = await db.Order.findAll({
        where: {
          user_id: checkUser.id,
        },
        attributes: ["id", "total","discount_voucher_value", "status", "createdAt"],
        include: [
          {
            model: db.OrderDetail,
            as: "orderDetail",
            attributes: ["id", "quantity", "price"],
            include: [
              {
                model: db.Product,
                as: "product",
                attributes: ["id", "name"],
                include: [
                  {
                    model: db.Image,
                    as: "images",
                    limit: 1,
                    separate: true,
                    attributes: ["url_image"],
                  },
                ],
              },
              {
                model: db.Size,
                as: "size",
                attributes: ["size"],
              },
            ],
          },
          {
            model: db.Address,
            as: "address",
            attributes: ["address", "phone", "name"],
          }
        ],
        raw: false,
        // nest: true,
      });
      resolve({
        data: order,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const paymentOrder = async (data, user, ipAddr) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await db.User.findOne({
        where: {
          email: user,
        },
      });
      if (checkUser === null) {
        resolve({
          errCode: 1,
          errMessage: "Người dùng không tồn tại",
        });
        return;
      }
      const checkOrder = await db.Order.findOne({
        where: {
          id: data.order_id,
          user_id: checkUser.id,
        },
      });
      if (checkOrder === null) {
        resolve({
          errCode: 1,
          errMessage: "Đơn hàng không tồn tại",
        });
        return;
      }
      if (checkOrder.status === "success") {
        resolve({
          errCode: 1,
          errMessage: "Đơn hàng đã thanh toán",
        });
        return;
      }
      let total = checkOrder.total;
      if(data.voucher){
        const checkVoucher = await db.Voucher.findOne({
          where: {
            code: data.voucher,
            is_active: 1,
            expiry_date: {
              [db.Sequelize.Op.gt]: new Date(),
            },
          },
        });
        if (checkVoucher === null) {
          resolve({
            errCode: 1,
            errMessage: "Voucher không tồn tại",
          });
          return;
        }
        if (checkVoucher.limit<=0) {
          resolve({
            errCode: 1,
            errMessage: "Voucher đã hết lượt sử dụng",
          });
          return;
        }
        if (checkVoucher.type === "percent") {
          total = checkOrder.total - checkVoucher.discount_value;
          await db.Order.update(
            {
              voucher_id: checkVoucher.id,
              discount_voucher_value: total,
            },
            {
              where: {
                id: data.order_id,
              },
            }
          );
        } else if (checkVoucher.type === "fixed") {
          total = checkOrder.total - (checkOrder.total * checkVoucher.discount_value / 100);
          await db.Order.update(
            {
              voucher_id: checkVoucher.id,
              discount_voucher_value: total,
            },
            {
              where: {
                id: data.order_id,
              },
            }
          );
        }
      }
      var ipAddr = ipAddr;

      var tmnCode = process.env.VNP_TMNCODE;
      var secretKey = process.env.VNP_HASHSECRET;
      var vnpUrl = process.env.VNP_URL;
      var returnUrl = process.env.VNP_RETURNURL;
      var createDate = moment().tz("Asia/Bangkok").format("YYYYMMDDHHmmss");
      var orderId = data.order_id;
      var amount = total;
      var bankCode = data.bank_code;
      var orderInfo = "Thanh toán hóa đơn";
      var orderType = "billpayment";
      var locale = "vn";
      var currCode = "VND";
      var vnp_Params = {};
      vnp_Params["vnp_Version"] = "2.1.0";
      vnp_Params["vnp_Command"] = "pay";
      vnp_Params["vnp_TmnCode"] = tmnCode;
      vnp_Params["vnp_Locale"] = locale;
      vnp_Params["vnp_CurrCode"] = currCode;
      vnp_Params["vnp_TxnRef"] = orderId;
      vnp_Params["vnp_OrderInfo"] = orderInfo;
      vnp_Params["vnp_OrderType"] = orderType;
      vnp_Params["vnp_Amount"] = amount * 100;
      vnp_Params["vnp_ReturnUrl"] = returnUrl;
      vnp_Params["vnp_IpAddr"] = ipAddr;
      vnp_Params["vnp_CreateDate"] = createDate;
      if (bankCode !== null && bankCode !== "") {
        vnp_Params["vnp_BankCode"] = "VNBANK";
      }
      vnp_Params = sortObject(vnp_Params);
      var signData = querystring.stringify(vnp_Params, { encode: false });

      var hmac = crypto.createHmac("sha512", secretKey);
      var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
      vnp_Params["vnp_SecureHash"] = signed;

      vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
      resolve({
        errCode: 0,
        data: vnpUrl,
      });
    } catch (error) {
      reject(error);
    }
  });
};
function sortObject(obj) {
  var sorted = {};
  var str = [];
  var key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

const vnpayReturn = async (data, user) => {
  return new Promise(async (resolve, reject) => {
    try {
      var vnp_Params = data;

      var secureHash = vnp_Params["vnp_SecureHash"];

      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      vnp_Params = sortObject(vnp_Params);

      var tmnCode = process.env.VNP_TMNCODE;
      var secretKey = process.env.VNP_HASHSECRET;

      var signData = querystring.stringify(vnp_Params, { encode: false });

      var hmac = crypto.createHmac("sha512", secretKey);
      var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
      if(secureHash === signed){
        const checkOrder = await db.Order.findOne({
          where: {
            id: vnp_Params["vnp_TxnRef"],
          },
        });
        if(vnp_Params["vnp_ResponseCode"] === "00"){
        const updateOrder = await db.Order.update(
            {
              status: "success",
            },
            {
              where: {
                id: vnp_Params["vnp_TxnRef"],
                status: "pending",
              },
            }
          );
        const updateVoucher = await db.Voucher.update(
          {
            limit: db.sequelize.literal("limit - 1"),
          },
        );
          if(updateOrder[0] === 0){
            resolve({
              errCode: 1,
              errMessage: "fail",
            });
          } else {  
            await updateStockSize(vnp_Params["vnp_TxnRef"], "sub");
            resolve({
              errCode: 0,
              errMessage: "success",
            });
          }
        }else{
          await db.Order.update(
            {
              status: "cancel",
            },
            {
              where: {
                id: vnp_Params["vnp_TxnRef"],
              },
            }
          );
          await updateStockSize(vnp_Params["vnp_TxnRef"], "add");
          resolve({
            errCode: 1,
            errMessage: "fail",
          });
        }
      }
      else{
        resolve({
          errCode: 1,
          errMessage: "hack à cu",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const updateStockSize = async (order_id, operator) => {
  return new Promise(async (resolve, reject) => {
    try {
      const orderDetail = await db.OrderDetail.findAll({
        where: {
          order_id: order_id,
        },
        attributes: ["product_id", "size_id", "quantity"],
      });
      if(operator === "add"){
      orderDetail.map(async (item) => {
        const size = await db.Size.findOne({
          where: {
            id: item.size_id,
          },
        });
        await db.Size.update(
          {
            stock: size.stock + item.quantity,
          },
          {
            where: {
              id: item.size_id,
            },
          }
        );
      });
      resolve({
        errCode: 0,
        errMessage: "success",
      });
      } else if(operator === "sub"){
      orderDetail.map(async (item) => {
        const size = await db.Size.findOne({
          where: {
            id: item.size_id,
          },
        });
        const checkstock = await db.Size.findOne({
          where: {
            id: item.size_id,
          },
          attributes: ["stock"],
        });
        if (checkstock.stock < item.quantity) {
          resolve({
            errCode: 1,
            errMessage: "Số lượng sản phẩm không đủ",
          });
          return;
        }
        await db.Size.update(
          {
            stock: size.stock - item.quantity,
          },
          {
            where: {
              id: item.size_id,
            },
          }
        );
      },
      resolve({
        errCode: 0,
        errMessage: "success",
      })
    );
    }} catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createOrder,
  getOrders,
  paymentOrder,
  vnpayReturn,
};
