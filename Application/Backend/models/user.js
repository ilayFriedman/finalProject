const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    Username: {
        type: String,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    FirstName: {
        type: String,
        required: true
    },
    LastName: {
        type: String,
        required: true
    },
    getPermissionUpdate: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('Users', UserSchema, 'Users');