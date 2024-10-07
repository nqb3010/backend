"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Product extends Model {
    static associate(models) {
      Product.hasMany(models.Size, {
        foreignKey: "product_id", // Khóa ngoại trong bảng Size
        sourceKey: "id", // Khóa chính trong bảng Product
        as: "sizes", // Tên alias cho mối quan hệ
      });
      Product.hasMany(models.Cart, {
        foreignKey: "product_id",
        sourceKey: "id",
        as: "carts",
      });
      Product.hasMany(models.Image, {
        foreignKey: "product_id",
        sourceKey: "id",
        as: "images",
      });
    }
  }
  Product.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      discount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Product",
    }
  );

  return Product;
};
