const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        feedback: {
            type: String,
            required: true,
            trim: true
        },

        photo: {
            type: String,
            default: null
        },

        status: {
            type: String,
            enum: ['pending', 'approved'],
            default: 'pending'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    'Testimonial',
    testimonialSchema
);