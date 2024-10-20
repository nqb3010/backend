'Use Strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class OrderDetail extends Model {
        static associate(models) {
            OrderDetail.belongsTo(models.Order, {
                foreignKey: 'order_id',
                targetKey: 'id',
                as: 'order'
            });
            OrderDetail.belongsTo(models.Product, {
                foreignKey: 'product_id',
                targetKey: 'id',
                as: 'product'
            });
            OrderDetail.belongsTo(models.Size, {
                foreignKey: 'size_id',
                targetKey: 'id',
                as: 'size'
            });
        }
    }
    OrderDetail.init({
        id: {
            type: DataTypes.INTEGER,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        order_id: {
            type: DataTypes.UUID,
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
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'OrderDetail',
        timestamps: false,
    });
    return OrderDetail;
}