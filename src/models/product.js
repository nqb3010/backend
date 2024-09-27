'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Product extends Model {
        static associate(models) {
            Product.hasMany(models.Size, { 
                foreignKey: 'id', // Khóa ngoại trong bảng Size
                sourceKey: 'size_id', // Khóa chính trong bảng Product
                as: 'sizes' // Tên alias cho mối quan hệ
            });       
    }
    }
    Product.init({
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
        url_img: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        size_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Product',
    });

    return Product;
};