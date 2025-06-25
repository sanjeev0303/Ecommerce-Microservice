const mongoose = require('mongoose');
const { DB_URL } = require('../config');

const connectWithRetry = () => {
    mongoose.connect(DB_URL).catch(() => {}); // Suppress unhandled promise
};

module.exports = async () => {
    mongoose.connection.on('connected', () => {
        console.log('MongoDB connected');
    });

    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected. Reconnecting...');
        connectWithRetry();
    });

    process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed due to app termination');
        process.exit(0);
    });

    connectWithRetry();
};
