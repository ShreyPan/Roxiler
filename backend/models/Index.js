const sequelize = require('../config/database');

const User = require('./User');
const Store = require('./Store');
const Rating = require('./Rating');

User.hasMany(Rating, { foreignKey: 'user_id' });
Rating.belongsTo(User, { foreignKey: 'user_id' });

Store.hasMany(Rating, { foreignKey: 'store_id' });
Rating.belongsTo(Store, { foreignKey: 'store_id' });

User.hasOne(Store, { foreignKey: 'owner_id', as: 'ownedStore' });
Store.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

module.exports = {
    sequelize,
    User,
    Store,
    Rating
};