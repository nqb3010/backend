'Use Strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Order extends Model {
        static associate(models) {
            Order.belongsTo(models.User, {
                foreignKey: 'user_id',
                targetKey: 'id',
                as: 'user'
            });
            Order.hasMany(models.OrderDetail, {
                foreignKey: 'order_id',
                sourceKey: 'id',
                as: 'orderDetail'
            });
            Order.belongsTo(models.Address, {
                foreignKey: 'addr_id',
                targetKey: 'id',
                as: 'address'
            });
            Order.belongsTo(models.Voucher, {
                foreignKey: 'voucher_id',
                targetKey: 'id',
                as: 'voucher'
            });
        }
    }
    Order.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        total: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        discount_voucher_value: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        voucher_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('pending', 'success', 'cancel'),
            allowNull: false,
            defaultValue: 'pending',
        },
        addr_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Order',
    });
    return Order;
}