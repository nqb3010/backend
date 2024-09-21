'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class ProductSize extends Model {}

    ProductSize.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        size: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'ProductSize',
        timestamps: false,
    });

    return ProductSize;
}