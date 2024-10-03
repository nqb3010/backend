'Use Strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Cart extends Model {
        static associate(models) {
            Cart.belongsTo(models.User, {
                foreignKey: 'user_id',
                targetKey: 'id',
                as: 'user'
            });
            Cart.belongsTo(models.Product, {
                foreignKey: 'product_id',
                targetKey: 'id',
                as: 'product'
            });
            Cart.belongsTo(models.Size, {
                foreignKey: 'size_id',
                targetKey: 'id',
                as: 'size'
            });
        }
    }
    Cart.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        size_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Cart',
        timestamps: false,
    });

    return Cart;
}