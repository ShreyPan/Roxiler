const { User, Store, Rating } = require('../models');
const bcrypt = require('bcryptjs');

const normalizeText = (value) => (typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/\s+/g, ' ').trim() : value);
const normalizeEmail = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value);
const normalizeSortOrder = (value) => (typeof value === 'string' && value.toLowerCase() === 'desc' ? 'DESC' : 'ASC');
const normalizeSortField = (value, allowedFields) => (allowedFields.includes(value) ? value : allowedFields[0]);

exports.getAllUsers = async (req, res) => {
    try {
        const { sortBy = 'id', order = 'asc' } = req.query;

        const allowedFields = ['id', 'name', 'email', 'role'];
        const safeSortBy = normalizeSortField(sortBy, allowedFields);
        const safeOrder = normalizeSortOrder(order);

        const users = await User.findAll({
            order: [[safeSortBy, safeOrder]]
        });

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let averageRating = null;

        if (user.role === 'store_owner') {
            const store = await Store.findOne({ where: { owner_id: user.id } });

            if (store) {
                const ratings = await Rating.findAll({ where: { store_id: store.id } });

                if (ratings.length > 0) {
                    const totalRating = ratings.reduce((sum, rating) => sum + rating.value, 0);
                    averageRating = totalRating / ratings.length;
                }
            }
        }

        res.status(200).json({ ...user.toJSON(), averageRating });

    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
};

exports.getAdminStats = async (req, res) => {
    try {
        const [totalUsers, totalStores, totalRatings] = await Promise.all([
            User.count(),
            Store.count(),
            Rating.count()
        ]);

        res.status(200).json({ totalUsers, totalStores, totalRatings });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};

exports.addUser = async (req, res) => {
    try {
        const name = normalizeText(req.body.name);
        const email = normalizeEmail(req.body.email);
        const password = req.body.password;
        const address = normalizeText(req.body.address);
        const role = typeof req.body.role === 'string' ? req.body.role.trim() : req.body.role;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({ name, email, password: hashedPassword, address, role });

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'User already exists' });
        }

        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Error adding user' });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const role = typeof req.body.role === 'string' ? req.body.role.trim() : req.body.role;

        const allowedRoles = ['admin', 'normal', 'store_owner'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.update({ role });

        res.status(200).json({ message: 'User role updated successfully', user });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ message: 'Error updating user role' });
    }
};