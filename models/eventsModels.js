const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    kino: {
        type: [],
    },
    news: {
        type: [],
    },
})


module.exports = mongoose.model('Events', eventSchema);