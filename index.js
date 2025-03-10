const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const { schedule } = require("node-cron");

// ----------
const connectDB = require('./config/db');
const { parseKinoAfisha, parseNews, parseIt, parseConcert} = require("./controllers/updateBDController");

const PORT = process.env.PORT || 5000;
const app = express();
connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ credentials: true, origin: '*' }));
app.use(cookieParser());

app.use('/users', require('./routes/userRoutes'));
app.use('/events', require('./routes/eventRoutes'));




schedule('50 17 * * *', () => {
    console.log('Запуск задачи парсинга данных в 00:00 по Москве');
    parseKinoAfisha()
        .then(data => console.log("Успешное обновление кино".green))
        .catch(console.error);

}, {
    scheduled: true,
    timezone: "Europe/Moscow"
});

schedule('50 17 * * *', () => {
    console.log('Запуск задачи парсинга данных каждый час по Москве');
    parseNews()
        .then(data => console.log("Успешное обновление новостей".green))
        .catch(console.error);
    parseIt()
        .then(data => console.log("Успешное обновление IT мероприятий".green))
        .catch(console.error);

}, {
    scheduled: true,
    timezone: "Europe/Moscow"
});

// parseKinoAfisha()
//     .then(data => console.log("Успешное обновление кино".green))
//     .catch(console.error);
// parseNews()
//     .then(data => console.log("Успешное обновление новостей".green))
//     .catch(console.error);
// parseIt()
//     .then(data => console.log("Успешное обновление IT".green))
//     .catch(console.error);
// parseConcert()
//     .then(data => console.log("Успешное обновление concert".green))
//     .catch(console.error);



app.listen(PORT, () => {
    console.log(`Server started on PORT ${PORT}`.green);

});