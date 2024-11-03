const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const colors = require('colors');
const cookieParser = require('cookie-parser');
// ----------
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ credentials: true, origin: '*' }));
app.use(cookieParser());

app.use('/users', require('./routes/userRoutes'));
app.use('/event', require('./routes/eventRoutes'));

app.listen(PORT, () => {
    console.log(`Server started on PORT ${PORT}`.green);
});