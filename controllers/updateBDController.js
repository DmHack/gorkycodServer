const axios = require('axios');
const cheerio = require('cheerio');
// -----------------------------
const Kino = require('../models/kinoModels');





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
        details: $('.visualEditorInsertion p').text().trim() || $('.visualEditorInsertion section section article section').text().trim() // Получаем дополнительные данные
    };
    return additionalData;
}

async function parseKinoAfisha() {
    const combinedDataArray = [];
    const firstSiteData = await fetchDataFromFirstSite();

    for (const item of firstSiteData) {
        const additionalData = await fetchDataFromSecondSite(item.uid);
        const combinedData = { ...item, ...additionalData }; // Объединяем объекты
        combinedDataArray.push(combinedData); // Добавляем в массив
    }

    await Kino.deleteMany({})
    await Kino.create({kino:combinedDataArray})
}

module.exports = {
    parseKinoAfisha
};