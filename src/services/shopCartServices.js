const { get } = require("../config/mailConfig");
const db = require("../models/index");
const userService = require("./userServices");
const productServices = require("./productServices");

const addToCart = async (data, user) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(data);
      const checkUser = await userService.checkUseremail(user);
      if (data.quantity <= 0) {
        resolve({
          errCode: 1,
          errMessage: "Quantity must be greater than 0",
        });
        return;
      }
      if (checkUser === true) {
        const getIDuser = await db.User.findOne({
          where: {
            email: user,
          },
        });
        const getIDsize = await db.Size.findOne({
          where: {
            product_id: data.product_id,
            size: data.size,
          },
        });
        if (getIDsize === null) {
          resolve({
            errCode: 1,
            errMessage: "Size not found",
          });
          return;
        }
        const checkCart = await db.Cart.findOne({
          where: {
            user_id: getIDuser.id,
            product_id: data.product_id,
            size_id: getIDsize.id,
          },
        });
        if (checkCart === null) {
          const addCart = await db.Cart.create({
            user_id: getIDuser.id,
            product_id: data.product_id,
            size_id: getIDsize.id,
            quantity: data.quantity,
          });
          resolve({
            errCode: 0,
            errMessage: "Add to cart successfully",
          });
        } else {
          const checkQuantity = await db.Cart.findOne({
            where: {
              user_id: getIDuser.id,
              product_id: data.product_id,
              size_id: getIDsize.id,
            },
          });
          const updateCart = await db.Cart.update(
            {
              quantity: data.quantity + checkQuantity.quantity,
            },
            {
              where: {
                user_id: getIDuser.id,
                product_id: data.product_id,
                size_id: getIDsize.id,
              },
            }
          );
          resolve({
            errCode: 0,
            errMessage: "Update cart successfully",
          });
        }
      } else {
        resolve({
          errCode: 1,
          errMesssage: "User not found",
        });
      }
    } catch (error) {
      resolve(error);
    }
  });
};

const getAllcartUser = async (data, user) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await userService.checkUseremail(user);
      if (checkUser === true) {
        const User = await db.User.findOne({
          where: {
            email: user,
          },
        });
        const Cart = await db.Cart.findAll({
          where: {
            user_id: User.id,
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
              'total_price'
            ]
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
                ]
              ],
              include: [
                {
                  model: db.Image,
                  as: "images",
                  attributes: ["url_image"],
                },
              ],
            },
            { 
              model: db.Size, 
              as: "size", 
              attributes: ["size"] 
            },
          ],
          group: ['Cart.id', 'product.id', 'size.id'],
          raw: true,
          nest: true,
          // logging: console.log
        });
        
        // Calculate grand total (already in integer form from the query)
        console.log(User.id);
        const grandTotal = Cart.reduce((sum, item) => sum + item.total_price, 0);
        
        resolve({
          items: Cart,
          grandTotal: grandTotal,
        });
      } else {
      }
    } catch (error) {
      resolve(error);
    }
  });
};

const deleteCart = async (data, user) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await userService.checkUseremail(user);
      if (checkUser === true) {
        const User = await db.User.findOne({
          where: {
            email: user,
          },
        });
        const Cart = await db.Cart.findOne({
          where: {
            user_id: User.id,
            product_id: data.product_id,
          },
        });
        if (Cart === null) {
          resolve({
            errCode: 1,
            errMessage: "Cart not found",
          });
        } else {
          const deleteCart = await db.Cart.destroy({
            where: {
              user_id: User.id,
              product_id: data.product_id,
            },
          });
          resolve({
            errCode: 0,
            errMessage: "Delete cart successfully",
          });
        }
      } else {
        resolve({
          errCode: 1,
          errMessage: "User not found",
        });
      }
    } catch (error) {
      resolve(error);
    }
  });
};

module.exports = {
  addToCart,
  getAllcartUser,
  deleteCart,
};
