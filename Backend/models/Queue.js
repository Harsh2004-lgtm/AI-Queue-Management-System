const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
    tokenNumber: {
        type: Number,
        required: true
    },

    customerName: {
        type: String,
        required: true
    },

    service: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ['waiting', 'serving', 'completed'],
        default: 'waiting'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Queue', queueSchema);