const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const { schedule } = require("node-cron");

// ----------
const connectDB = require('./config/db');
const { parseKinoAfisha } = require("./controllers/updateBDController");

const PORT = process.env.PORT || 5000;
const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ credentials: true, origin: '*' }));
app.use(cookieParser());

app.use('/users', require('./routes/userRoutes'));
app.use('/event', require('./routes/eventRoutes'));



schedule('0 0 * * *', () => {
    console.log('Запуск задачи парсинга данных в 00:00 по Москве');
    parseKinoAfisha()
        .then(data => console.log("Успешное обновление".green))
        .catch(console.error);
}, {
    scheduled: true,
    timezone: "Europe/Moscow"
});

// parseKinoAfisha()
//     .then(data => console.log("Успешное обновление".green))
//     .catch(console.error);

app.listen(PORT, () => {
    console.log(`Server started on PORT ${PORT}`.green);
});