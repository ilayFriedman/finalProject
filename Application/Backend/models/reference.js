const mongoose = require('mongoose')

const ReferenceSchema = new mongoose.Schema({
    Title: {
        type: String,
        required: true
    },
    CreatorId: {
        type: String,
        required: true
    },
    Authors: {
        type: String,
        required: true
    },
    Publication: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    CreationTime: {
        type: Date,
        required: true
    },
    Link: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('References', ReferenceSchema, 'References');