const mongoose = require('mongoose')
const schema = mongoose.Schema
const ContextSchema = new schema({
    Title: {
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
    }
})

module.exports = mongoose.model('Contexts', ContextSchema, 'Contexts');