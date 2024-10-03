'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Size extends Model {
        static associate(models) {
            Size.belongsTo(models.Product, {
                foreignKey: 'product_id',
                as: 'product',
        });
            Size.hasMany(models.Cart, {
                foreignKey: 'size_id',
                sourceKey: 'id',
                as: 'carts'
            });
    }
    }
    Size.init({
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
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Size',
        timestamps: false,
    });

    return Size;
}