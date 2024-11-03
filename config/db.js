const mongoose = require('mongoose');



const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL_USER);

        console.log(`MongoDB connected: ${conn.connection.host}`.green.underline)
    } catch (err) {
        console.log(`ERROR DB: ${err}`.red.underline);
        process.exit(1)
    }
}


module.exports = connectDB;