const mongoose = require('mongoose')

const GroupSchema = new mongoose.Schema({
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
    Members: {
        type: Object,
        required: true
    }
})

module.exports = mongoose.model('Groups', GroupSchema, 'Groups');