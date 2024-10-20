'Use Strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Address extends Model {
        static associate(models) {
            Address.belongsTo(models.User, {
                foreignKey: 'user_id',
                targetKey: 'id',
                as: 'user'
            });
            Address.hasMany(models.Order, {
                foreignKey: 'addr_id',
                sourceKey: 'id',
                as: 'order'
            });
        }
    }
    Address.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        default: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    }, {
        sequelize,
        modelName: 'Address',
        timestamps: false,
    });

    return Address;
}