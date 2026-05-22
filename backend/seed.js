require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Store } = require('./models');

const users = [
    {
        name: 'System Administrator Root User',
        email: 'admin@ratings.local',
        password: 'Admin@1234',
        address: '1 Admin Plaza, Ratings City',
        role: 'admin'
    },
    {
        name: 'Store Owner Alpha Account',
        email: 'owner.alpha@ratings.local',
        password: 'Owner@1234',
        address: '10 Alpha Street, Ratings City',
        role: 'store_owner'
    },
    {
        name: 'Store Owner Beta Account',
        email: 'owner.beta@ratings.local',
        password: 'Owner@1234',
        address: '20 Beta Avenue, Ratings City',
        role: 'store_owner'
    },
    {
        name: 'Normal User One Account',
        email: 'user.one@ratings.local',
        password: 'User@1234',
        address: '100 User Lane, Ratings City',
        role: 'normal'
    },
    {
        name: 'Normal User Two Account',
        email: 'user.two@ratings.local',
        password: 'User@1234',
        address: '200 User Lane, Ratings City',
        role: 'normal'
    }
];

const stores = [
    {
        name: 'Alpha Downtown Store',
        email: 'alpha-store@ratings.local',
        address: '15 Market Road, Ratings City',
        ownerEmail: 'owner.alpha@ratings.local'
    },
    {
        name: 'Beta Riverside Store',
        email: 'beta-store@ratings.local',
        address: '77 River Walk, Ratings City',
        ownerEmail: 'owner.beta@ratings.local'
    }
];

const seed = async () => {
    try {
        await sequelize.sync();

        const createdUsers = {};

        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const [record] = await User.findOrCreate({
                where: { email: user.email },
                defaults: {
                    name: user.name,
                    email: user.email,
                    password: hashedPassword,
                    address: user.address,
                    role: user.role
                }
            });

            if (!record.isNewRecord) {
                await record.update({
                    name: user.name,
                    address: user.address,
                    role: user.role,
                    password: hashedPassword
                });
            }

            createdUsers[user.email] = record;
        }

        for (const store of stores) {
            const owner = createdUsers[store.ownerEmail];

            if (!owner) {
                throw new Error(`Owner not found for store ${store.name}`);
            }

            const [record] = await Store.findOrCreate({
                where: { email: store.email },
                defaults: {
                    name: store.name,
                    email: store.email,
                    address: store.address,
                    owner_id: owner.id
                }
            });

            if (!record.isNewRecord) {
                await record.update({
                    name: store.name,
                    address: store.address,
                    owner_id: owner.id
                });
            }
        }

        console.log('Seed complete: 1 admin, 2 store owners, 2 stores, 2 normal users');
    } catch (error) {
        console.error('Seed failed:', error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

seed();