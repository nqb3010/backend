'Use Strict';
const e = require('express');
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Voucher extends Model {
        static associate(models) {
            Voucher.hasMany(models.Order, {
                foreignKey: 'voucher_id',
                sourceKey: 'id',
                as: 'order'
            });
        }
    }

    Voucher.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            code: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            type: {
                type: DataTypes.ENUM('percent', 'fixed'),
                allowNull: false,
            },
            discount_value: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            expiry_date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            min_order_value: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Voucher',
            timestamps: false,
        }
    );

    return Voucher;
}