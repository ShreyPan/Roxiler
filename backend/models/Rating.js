const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User');
const Store = require('./Store');

const Rating = sequelize.define('Rating', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, references: { model: User, key: 'id' } },
    store_id: { type: DataTypes.INTEGER, references: { model: Store, key: 'id' } },
    value: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } }
},
    {
        indexes: [
            {
                unique: true, fields: ['user_id', 'store_id']
            }
        ]

    });

module.exports = Rating;