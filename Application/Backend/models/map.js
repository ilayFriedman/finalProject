const mongoose = require('mongoose')

const MapSchema = new mongoose.Schema({
    MapName: {
        type: String,
        required: true
    },
    CreatorId: {
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
        required: true
    },
    Subscribers: {
        type: Array,
        required: true
    },
    ContainingFolders: {
        type: Array,
        default: []
    }
})

module.exports = mongoose.model('Maps', MapSchema, 'Maps');