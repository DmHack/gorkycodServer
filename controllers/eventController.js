const asyncHandler = require("express-async-handler");
const axios = require('axios');

// ------------------
const Events = require('../models/eventsModels')

const eventPrint = asyncHandler(async (req, res) => {
    const Event = await Events.find({});
    const nm = req.body.bdName;

    if (Event) {
        res.status(200).json(Event[0][nm])
    } else {
        res.status(400).json({
            message: "Error EventPrint"
        })
    }
})


const poiskEvents = asyncHandler(async (req, res) => {
    const uid = req.body.uid;
    const bdName = req.body.bdName;

    const event = await Events.findOne({ [`${bdName}.uid`]: uid }, { [`${bdName}.$`]: 1 });
    if (event) {
        res.status(200).json(event[bdName][0])
    } else {
        res.status(400).json({
            message: "poisk event error"
        })
    }
})




// const TOKEN = '5149187480:AAFyH7vJfmH67c-aowhjYTV4WfPsWCFsGS8'; // Замените на ваш токен
// const CHAT_ID = '1299133852';  // Замените на ID пользователя или группы
//
// async function sendMessage(chatId, text) {
//     const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
//
//     try {
//         const response = await axios.post(url, {
//             chat_id: chatId,
//             text: 'Hello',
//         });
//         console.log('Сообщение отправлено:', response.data.result);
//     } catch (error) {
//         console.error('Ошибка при отправке сообщения:', error.response ? error.response.data.description : error.message);
//     }
// }
//
// // Пример использования
// sendMessage(CHAT_ID, 'Привет, это тестовое сообщение!')
//     .catch(console.error);











module.exports = {
    eventPrint,
    poiskEvents,

}
