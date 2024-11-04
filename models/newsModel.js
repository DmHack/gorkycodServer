const mongoose = require('mongoose');

const newsSchema = mongoose.Schema({
    news: {
        type: [],
        required: true
    },
})


module.exports = mongoose.model('News', newsSchema);