const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const normalizeText = (value) => (typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/\s+/g, ' ').trim() : value);
const normalizeEmail = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value);

const toSafeUser = (user) => {
    if (!user) {
        return null;
    }

    const plainUser = user.toJSON ? user.toJSON() : user;
    const { password, ...safeUser } = plainUser;
    return safeUser;
};

exports.registerUser = async (req, res) => {
    try {
        const name = normalizeText(req.body.name);
        const email = normalizeEmail(req.body.email);
        const password = req.body.password;
        const address = normalizeText(req.body.address);

        if (!name || !email || !password || !address) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({ name, email, password: hashedPassword, address, role: 'normal' });

        return res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'User already exists' });
        }

        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Error registering user' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ message: 'Error logging in' });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findByPk(req.user.id);

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ message: 'Error updating password' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ user: toSafeUser(user) });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ message: 'Error fetching profile' });
    }
};

exports.updateMe = async (req, res) => {
    try {
        const name = normalizeText(req.body.name);
        const address = normalizeText(req.body.address);
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (typeof name === 'string' && name) {
            user.name = name;
        }

        if (typeof address === 'string' && address) {
            user.address = address;
        }

        await user.save();

        return res.status(200).json({ message: 'Profile updated successfully', user: toSafeUser(user) });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ message: 'Error updating profile' });
    }
};