const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User');

const Store = sequelize.define('Store', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    address: { type: DataTypes.STRING, allowNull: false },
    owner_id: { type: DataTypes.INTEGER, references: { model: User, key: 'id' }, allowNull: false }
});

module.exports = Store;