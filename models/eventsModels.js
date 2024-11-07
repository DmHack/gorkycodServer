const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    kino: {
        type: [],
    },
    news: {
        type: [],
    },
    it: {
        type: [],
    },
    concert: {
        type: [],
    }
})


module.exports = mongoose.model('Events', eventSchema);