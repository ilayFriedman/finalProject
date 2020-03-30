const mongoose = require('mongoose')

const FolderSchema = new mongoose.Schema({
        Name: {
            type: String,
            required: true
        },
        MapsInFolder: {
            type: Array,
            required: true
        },
        SubFolders: {
            type: Array,
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
       ParentDir: {
            type: String,
            required: true
        }

})

module.exports = mongoose.model('Folders', FolderSchema, 'Folders');