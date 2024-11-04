const axios = require('axios');
const cheerio = require('cheerio');
// -----------------------------
const Kino = require('../models/kinoModels');
const {login} = require("./userController");



async function fetchDataFromFirstSite() {
    const url = 'https://nn.kinoafisha.info/movies/'; // Замените на URL первого сайта
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const data = [];

    const { data: site1Data } = await axios.get(url);
        const $site1 = cheerio.load(site1Data);

        const moviePromises = $site1('.site_content .movies .grid_cell9 .movieList .movieList_item').map(async (index, element) => {
            const title = $site1(element).find('.movieItem_title').text().trim();
            const subTitle = $site1(element).find('.movieItem_subtitle').text().trim();
            const tags = $site1(element).find('.movieItem_details .movieItem_genres').text().trim();
            const yearAndContries = $site1(element).find('.movieItem_details .movieItem_year').text().trim();
            const img = $site1(element).find('.movieItem_poster .picture_image').attr('data-picture');
            const uid = JSON.parse($site1(element).find('.movieItem_actions .movieItem_favBtn').attr('data-param')).uid;

            data.push({
                title,
                subTitle,
                img,
                tags,
                yearAndContries,
                uid,
            });
        })
    return data;
}

async function fetchDataFromSecondSite(uid) {
    const url = `https://www.kinoafisha.info/movies/${uid}/#submenu`; // Замените на URL второго сайта
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const additionalData = {
        details: $('.visualEditorInsertion p').text().trim() || $('.visualEditorInsertion section section article section').text().trim(),
    };
    return additionalData;
}

async function fetchDataFromSecondSite1(uid) {
    const url = `https://nn.kinoafisha.info/movies/${uid}/#schedule`; // Замените на URL второго сайта
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const cinemas = [];
    const additionalData1 = [];
    const additionalData2 = [];

    // Извлечение информации о кинотеатрах
    $('.showtimesCinema .showtimesCinema_wrapper .showtimesCinema_info').each(function() {
        const nameKinoteatr = $(this).find('.showtimesCinema_name').text().trim();
        const addrKinoteatr = $(this).find('.showtimesCinema_addr').text().trim() ||
            `Метро ${$(this).find('.showtimesCinema_metro .showtimesCinema_metroItem').text().trim()}`;

        additionalData1.push({
            nameKinoteatr,
            addrKinoteatr
        });
    });

    // Извлечение информации о сеансах
    $('.showtimes_cell').each(function() {
        const format = $(this).find('.showtimes_format').text().trim();

        // Инициализация массивов для sessionsTime и sessionsPrice
        const sessionsTimeArray = [];
        const sessionsPriceArray = [];

        // Цикл по каждому сеансу в ячейке
        $(this).find('.showtimes_sessions .showtimes_session').each(function() {
            const sessionsTime = $(this).find('.session_time').text().trim();
            const sessionsPrice = $(this).find('.session_price').text().trim();

            // Добавление в соответствующие массивы, если данные есть
            if (sessionsTime && sessionsPrice) {
                sessionsTimeArray.push(sessionsTime);
                sessionsPriceArray.push(sessionsPrice);
            }
        });

        // Добавление в additionalData2 только если есть данные о сеансах
        if (sessionsTimeArray.length > 0 || sessionsPriceArray.length > 0) {
            additionalData2.push({
                format,
                sessionsTime: sessionsTimeArray,
                sessionsPrice: sessionsPriceArray
            });
        }
    });

    // Объединение данных в один массив объектов
    for (let i = 0; i < Math.max(additionalData1.length, additionalData2.length); i++) {
        const cinemaData = {
            ...additionalData1[i], // Оператор распространения для включения данных о кинотеатре
            ...additionalData2[i]  // Оператор распространения для включения данных о сеансах
        };
        cinemas.push(cinemaData);
    }
    return cinemas;
}

async function parseKinoAfisha() {
    const combinedDataArray = [];
    const firstSiteData = await fetchDataFromFirstSite();

    for (const item of firstSiteData) {
        const additionalData = await fetchDataFromSecondSite(item.uid);
        const additionalData1 = await fetchDataFromSecondSite1(item.uid)
        const combinedData = { ...item, ...additionalData, dopInfa:additionalData1 }; // Объединяем объекты
        combinedDataArray.push(combinedData); // Добавляем в массив
    }
    console.log(combinedDataArray)

    await Kino.deleteMany({})
    await Kino.create({kino:combinedDataArray})
}

















module.exports = {
    parseKinoAfisha
};