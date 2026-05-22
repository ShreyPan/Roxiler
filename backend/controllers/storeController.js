const { User, Store, Rating } = require('../models');
const { fn, col } = require('sequelize');

const normalizeText = (value) => (typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/\s+/g, ' ').trim() : value);
const normalizeEmail = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value);
const normalizeSortOrder = (value) => (typeof value === 'string' && value.toLowerCase() === 'desc' ? 'DESC' : 'ASC');
const normalizeSortField = (value, allowedFields) => (allowedFields.includes(value) ? value : allowedFields[0]);

exports.getAllStores = async (req, res) => {
    try {
        const { sortBy = 'id', order = 'asc' } = req.query;

        const allowedFields = ['id', 'name', 'address', 'averageRating'];
        const safeSortBy = normalizeSortField(sortBy, allowedFields);
        const sortOrder = normalizeSortOrder(order);

        const stores = await Store.findAll({
            attributes: {
                include: [
                    [fn('AVG', col('Ratings.value')), 'averageRating']
                ]
            },
            include: [
                {
                    model: Rating,
                    attributes: []
                }
            ],
            group: ['Store.id'],
            order: [[safeSortBy === 'averageRating' ? col('averageRating') : safeSortBy, sortOrder]]
        });

        let ratingsByStore = new Map();
        if (req.user) {
            const myRatings = await Rating.findAll({
                where: { user_id: req.user.id },
                attributes: ['store_id', 'value']
            });

            ratingsByStore = new Map(myRatings.map((rating) => [rating.store_id, rating.value]));
        }

        res.status(200).json(
            stores.map((store) => ({
                ...store.toJSON(),
                userRating: ratingsByStore.get(store.id) ?? null
            }))
        );
    } catch (error) {
        console.error('Error fetching stores:', error);
        res.status(500).json({ message: 'Error fetching stores' });
    }
};

exports.getStoreById = async (req, res) => {
    try {
        const { id } = req.params;

        const store = await Store.findOne({
            where: { id },
            attributes: {
                include: [
                    [fn('AVG', col('Ratings.value')), 'averageRating']
                ]
            },
            include: [
                {
                    model: Rating,
                    attributes: []
                }
            ],
            group: ['Store.id']
        })

        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        res.status(200).json(store);
    } catch (error) {
        console.error('Error fetching store:', error);
        res.status(500).json({ message: 'Error fetching store' });
    }
};

exports.addStore = async (req, res) => {
    try {
        const name = normalizeText(req.body.name);
        const email = normalizeEmail(req.body.email);
        const address = normalizeText(req.body.address);
        const owner_id = Number(req.body.owner_id);

        const owner = await User.findByPk(owner_id);

        if (!owner || owner.role !== 'store_owner') {
            return res.status(404).json({ message: 'Store owner not found' });
        }

        const newStore = await Store.create({ name, email, address, owner_id });

        res.status(201).json({ message: 'Store created successfully', store: newStore });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Store already exists' });
        }

        console.error('Error adding store:', error);
        res.status(500).json({ message: 'Error adding store' });
    }
};