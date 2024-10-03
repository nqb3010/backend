'Use strict';
const { Model, DataTypes } = require('sequelize');

// models/user.js
module.exports = (sequelize) => {
    class User extends Model {
        static associate(models) {
            User.hasMany(models.Cart, {
                foreignKey: 'user_id',
                sourceKey: 'id',
                as: 'carts'
            });
        }
    }
    User.init({
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      code : {
        type: DataTypes.STRING,
        allowNull: true,
      },
    }, {
        sequelize,
        modelName: 'User',
    });

    return User;
}