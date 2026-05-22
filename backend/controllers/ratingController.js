const { User, Store, Rating } = require('../models');

const toInt = (value) => Number.parseInt(value, 10);

exports.submitRating = async (req, res) => {

    try {
        const store_id = toInt(req.body.store_id);
        const value = toInt(req.body.value);

        const store = await Store.findByPk(store_id);

        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        const newRating = await Rating.create({ user_id: req.user.id, store_id, value });

        res.status(201).json({ message: 'Rating submitted successfully', rating: newRating });
    } catch (error) {

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Already rated this store' });
        }
        console.error('Error submitting rating:', error);
        res.status(500).json({ message: 'Error submitting rating' });
    }
};

exports.updateRating = async (req, res) => {

    try {
        const store_id = toInt(req.body.store_id);
        const value = toInt(req.body.value);

        const rating = await Rating.findOne({
            where: { user_id: req.user.id, store_id }
        });

        if (!rating) {
            return res.status(404).json({ message: 'Rating not found' });
        }

        rating.value = value;
        await rating.save();

        res.status(200).json({ message: 'Rating updated successfully', rating });
    }
    catch (error) {
        console.error('Error updating rating:', error);
        res.status(500).json({ message: 'Error updating rating' });
    }
};

exports.getStoreRatings = async (req, res) => {

    try {
        const store = await Store.findOne({
            where: { owner_id: req.user.id }
        });

        if (!store) {

            return res.status(404).json({ message: 'Store not found' });
        }

        const ratings = await Rating.findAll({
            where: { store_id: store.id },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        res.status(200).json({ message: 'Ratings retrieved successfully', ratings });
    } catch (error) {
        console.error('Error retrieving ratings:', error);
        res.status(500).json({ message: 'Error retrieving ratings' });
    }
};