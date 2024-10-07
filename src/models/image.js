'Use Strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Image extends Model {
        static associate(models) {
        Image.belongsTo(models.Product, {
            foreignKey: 'product_id',
            targetKey: 'id',
            as: 'product',
        });
        }
    }
    Image.init(
        {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        url_image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        },
        {
        sequelize,
        modelName: 'Image',
        timestamps: false,
        }
    );
    
    return Image;
    }