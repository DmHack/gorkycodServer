const axios = require('axios');
const cheerio = require('cheerio');
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require('uuid');
// -----------------------------
const Events = require('../models/eventsModels');


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

    await Events.findOneAndUpdate({}, {kino: combinedDataArray}, {
        new: true,
        upsert: true,
    });
}
// --------------------------------


const helpParseNews = asyncHandler(async (urlNews) => {
    const url = urlNews; // Замените на URL первого сайта
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const data = [];

    const { data: site1Data } = await axios.get(url);
    const $site1 = cheerio.load(site1Data);
    const text = $site1('.single-news__text p').text().trim();
    return text
})



const parseNews = asyncHandler(async (req, res) => {
    const result = []
    const url = 'https://nobl.ru/novosti-nizhegorodskoj-oblasti-za-vse-vremya/?page=1';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const data = [];

    const { data: site1Data } = await axios.get(url);
    const $site1 = cheerio.load(site1Data);

    const newsPromises = $site1('.news-page__inner .news-card-common').map(async (index, element) => {
        const title = $site1(element).find('.news-card-common__inner .news-card-common__title').text().trim();
        const tag = $site1(element).find('.news-card-common__inner .news-card-common__tags .tag-common').first().text().trim() || "Новости";
        const img = `https://nobl.ru${$site1(element).find('.news-card-common__img-wrap picture .news-card-common__img').attr('data-src')}`

        const dataNews = `${$site1(element).find('.news-card-common__inner .news-card-common__date-time .news-card-common__date').text().trim()} ${$site1(element).find('.news-card-common__inner .news-card-common__date-time .news-card-common__time').text().trim()}`;
        const ssl = `https://nobl.ru${$(element).attr('href')}`
        // const uid = JSON.parse($site1(element).find('.movieItem_actions .movieItem_favBtn').attr('data-param')).uid;

        data.push({
            title,
            tag,
            img,
            dataNews,
            ssl
        });
        })

    const massPolnNews = []

    for (const item of data) {
        const text = await helpParseNews(item.ssl);

        massPolnNews.push({
            text,
            uid: uuidv4()
        })
    }

    for (let i = 0; i < Math.max(massPolnNews.length, data.length); i++) {
        const cinemaData = {
            ...data[i],  // Оператор распространения для включения данных о сеансах
            ...massPolnNews[i] // Оператор распространения для включения данных о кинотеатре
        };
        result.push(cinemaData);
    }
    await Events.findOneAndUpdate({}, {news: result}, {
        new: true,
        upsert: true,
    });
})
// ---------------------------------------------

const parseIt = asyncHandler(async (req, res) => {
    const result = []
    const url = 'https://www.it52.info/';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const data = [];

    const { data: site1Data } = await axios.get(url);
    const $site1 = cheerio.load(site1Data);

    const newsPromises = $site1('.event').map(async (index, element) => {
        const title = $site1(element).find('.panel-body .row .col-sm-12 .event-header a').text().trim();
        const date = `${$site1(element).find('.panel-body .row .col-sm-12 .event-subheader span .event-date-inversed .event-day').text().trim()} ${$site1(element).find('.panel-body .row .col-sm-12 .event-subheader span .event-date-inversed .event-time').text().trim()}`;
        const addr = `${$site1(element).find('.panel-body .row .col-sm-12 .event-subheader span a [itemprop=address]').text().trim()} ${$site1(element).find('.panel-body .row .col-sm-12 .event-subheader span a [itemprop=name]').text().trim()}`;
        const img = $site1(element).find('.panel-body .row .col-sm-4 a .image-container img').attr('src');
        const organizator = $site1(element).find('.panel-body .row .col-sm-4 .event-organizer p a').text().trim();
        const tags = $site1(element).find('.panel-body .row .col-sm-4 .event-tags p a').first().text().trim() || 'IT';
        const Fulltext = $site1(element).find('.panel-body .row .col-sm-8 .event-description p').text().trim();
        let upFlText = Fulltext.replace(/\\n/g, '\n').replace(/\[at\]/g, '')
            .replace(/\[dot\]/g, '')
            .replace(/\[email\s*protected\]/g, '')
            .replace(/\s+/g, ' ') // Убираем лишние пробелы
            .trim();
        // const uid = JSON.parse($site1(element).find('.movieItem_actions .movieItem_favBtn').attr('data-param')).uid;

        data.push({
            title,
            date,
            addr,
            img,
            organizator,
            tags,
            upFlText,
            uid: uuidv4()
        });
    })


    await Events.findOneAndUpdate({}, {it: data}, {
        new: true,
        upsert: true,
    });
})

// ---------------------


// const parseConcert = asyncHandler(async (req, res) => {
//     const result = []
//     const url = 'https://www.afisha.ru/nnovgorod/schedule_concert/na-mesyac/?sort=date';
//     const response = await axios.get(url);
//     const $ = cheerio.load(response.data);
//
//     const data = [];
//
//     const { data: site1Data } = await axios.get(url);
//     const $site1 = cheerio.load(site1Data);
//
//     const newsPromises = $site1('.S52Wl .oP17O').map(async (index, element) => {
//         const title = $site1(element).attr("title");
//         const ts = $site1(element).find('.QWR1k ._JP4u').text().trim();
//         const tag = $site1(element).find('.QWR1k .S_wwn').text().trim();
//         const img = $site1(element).find('.QsWic .CjnHd .PwMBX img').attr('src');
//         const ssl = `https://www.afisha.ru${$site1(element).find('.QWR1k .CjnHd').attr('href')}`;
//
//         data.push({
//             title,
//             ts,
//             tag,
//             img,
//             ssl
//         });
//     })
//     await Events.findOneAndUpdate({}, {concert: data}, {
//         new: true,
//         upsert: true,
//     });
// })
//


const helpParseConcert = asyncHandler(async (urlNews) => {
    const url = urlNews; // Замените на URL первого сайта
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const data = [];

    const { data: site1Data } = await axios.get(url);
    const $site1 = cheerio.load(site1Data);
    const text = $site1('.ui-content .text-sm .content-block div p').text().trim();
    return text
})



const parseConcert = asyncHandler(async (req, res) => {
    const result = []
    const url = 'https://nn.kassir.ru/bilety-na-koncert?sort=1';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const data = [];

    const { data: site1Data } = await axios.get(url);
    const $site1 = cheerio.load(site1Data);

    const newsPromises = $site1('.w-full .gap-x-9  article').map(async (index, element) => {
        const title = $site1(element).find('.recommendation-item .recommendation-item_text-block .recommendation-item_title').text().trim();
        const addr = $site1(element).find('.recommendation-item .recommendation-item_text-block .recommendation-item_venue').text().trim();
        const dataCon = $site1(element).find('.recommendation-item .recommendation-item_text-block .recommendation-item_date span').text().trim();
        const img = $site1(element).find('.recommendation-item_img-block .recommendation-item_image .ui-picture img').attr('src');
        const price = $site1(element).find('.recommendation-item_img-block .recommendation-item_features-list .recommendation-item_price-block .rounded-full span').eq(2).text().trim();
        const ssl = `https://nn.kassir.ru${$site1(element).find('.recommendation-item .recommendation-item_text-block a').eq(0).attr('href')}`;

        // const ssl = `https://www.afisha.ru${$site1(element).find('.QWR1k .CjnHd').attr('href')}`;
        data.push({
            title,
            addr,
            dataCon,
            img,
            price,
            ssl,
            uid: uuidv4()
        });
    })
    const massPolnConcert = []

    for (const item of data) {
        const text = await helpParseConcert(item.ssl);

        massPolnConcert.push({
            text
        })
    }

    for (let i = 0; i < Math.max(massPolnConcert.length, data.length); i++) {
        const cinemaData = {
            ...data[i],  // Оператор распространения для включения данных о сеансах
            ...massPolnConcert[i] // Оператор распространения для включения данных о кинотеатре
        };
        result.push(cinemaData);
    }






    await Events.findOneAndUpdate({}, {concert: result}, {
        new: true,
        upsert: true,
    });
})







module.exports = {
    parseKinoAfisha,
    parseNews,
    parseIt,
    parseConcert
};