'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Size extends Model {
        static associate(models) {
            Size.belongsTo(models.Product, {
                foreignKey: 'size_id',
                as: 'product',
        });
    }
    }
    Size.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        size: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Size',
        timestamps: false,
    });

    return Size;
}