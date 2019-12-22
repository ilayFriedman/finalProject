const mongoose = require('mongoose')

const MapSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Creator: {
        type: String,
        required: true
    },
    CreationTime: {
        type: Date,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    Model: {
        type: Object,
        required: true
    },
    Permission: {
        type: Object,
        required: false
    },
    Followers: {
        type: Array,
        required: false
    }
})

module.exports = mongoose.model('Maps', MapSchema, 'Maps');