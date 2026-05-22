const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./models');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const storeRoutes = require('./routes/stores');
const ratingRoutes = require('./routes/ratings');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
    console.error('Unhandled server error:', error);

    if (res.headersSent) {
        return next(error);
    }

    res.status(500).json({ message: 'Internal server error' });
});

sequelize.sync()
    .then(() => console.log('Database connected and synced'))
    .catch(err => console.log(err));

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`)
);