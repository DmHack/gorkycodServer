const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    refresh: {
        type: String,
        default: ''
    },
    resetPasswordCod: {
        type: String
    }
})


module.exports = mongoose.model('Users', userSchema);