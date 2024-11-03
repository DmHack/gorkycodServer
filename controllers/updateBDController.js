// const asyncHandler = require("express-async-handler");
// const axios = require('axios');
// const cheerio = require('cheerio');
//
// const parseKinoAfisha = asyncHandler(async (req, res) => {
//     const movies = [];
//     const url = 'https://nn.kinoafisha.info/movies/';
//
//     const site1 = [];
//     try {
//         const { data: site1Data } = await axios.get(url);
//         const $site1 = cheerio.load(site1Data);
//
//         const moviePromises = $site1('.site_content .movies .grid_cell9 .movieList .movieList_item').map(async (index, element) => {
//             const title = $site1(element).find('.movieItem_title').text().trim();
//             const subTitle = $site1(element).find('.movieItem_subtitle').text().trim();
//             const tags = $site1(element).find('.movieItem_details .movieItem_genres').text().trim();
//             const yearAndContries = $site1(element).find('.movieItem_details .movieItem_year').text().trim();
//             const img = $site1(element).find('.movieItem_poster .picture_image').attr('data-picture');
//             const uid = JSON.parse($site1(element).find('.movieItem_actions .movieItem_favBtn').attr('data-param')).uid;
//
//             site1.push({
//                 title,
//                 subTitle,
//                 img,
//                 tags,
//                 yearAndContries,
//                 uid,
//             });
//         })
//
//     }  catch (err) {
//         console.log(err)
//     }
//
// });
//
// cron.schedule('50 20 * * *', () => {
//     console.log('Запуск обновления данных каждый день в полночь');
//     parseKinoAfisha();
// });



const axios = require('axios');
const cheerio = require('cheerio');

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
    console.log(data)
    return data;
}

async function fetchDataFromSecondSite(uid) {
    const url = `https://nn.kinoafisha.info/movies/${uid}`; // Замените на URL второго сайта
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Пример парсинга данных со второго сайта
    const additionalData = {
        details: $(element).find('.visualEditorInsertion p').text().trim() || $(element).find('.visualEditorInsertion section section article section').text().trim() // Получаем дополнительные данные
    };
    console.log(additionalData)
    return additionalData;
}

async function parseKinoAfisha() {
    console.log("start")
    const combinedDataArray = [];
    console.log("start")
    const firstSiteData = await fetchDataFromFirstSite();

    for (const item of firstSiteData) {
        const additionalData = await fetchDataFromSecondSite(item.uid);
        const combinedData = { ...item, ...additionalData }; // Объединяем объекты
        combinedDataArray.push(combinedData); // Добавляем в массив
    }

    console.log(combinedDataArray);
}

module.exports = parseKinoAfisha;