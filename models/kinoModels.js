const mongoose = require('mongoose');

const kinoSchema = mongoose.Schema({
    kino: {
        type: [],
        required: true
    },
})


module.exports = mongoose.model('Kino', kinoSchema);