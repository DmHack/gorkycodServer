const axios = require('axios');
const cheerio = require('cheerio');
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require('uuid');
const Events = require('../models/eventsModels');

// Утилитная функция для получения и парсинга HTML
async function fetchAndParse(url) {
    const response = await axios.get(url);
    return cheerio.load(response.data);
}

// Получение данных с первого сайта
async function fetchDataFromFirstSite() {
    const url = 'https://nn.kinoafisha.info/movies/';
    const $ = await fetchAndParse(url);
    const data = [];

    const moviePromises = $('.site_content .movies .grid_cell9 .movieList .movieList_item').map(async (index, element) => {
        const title = $(element).find('.movieItem_title').text().trim();
        const subTitle = $(element).find('.movieItem_subtitle').text().trim();
        const tags = $(element).find('.movieItem_details .movieItem_genres').text().trim();
        const yearAndCountries = $(element).find('.movieItem_details .movieItem_year').text().trim();
        const img = $(element).find('a picture img').attr('src');
        const uid = JSON.parse($(element).find('.movieItem_actions .movieItem_favBtn').attr('data-param')).uid;

        data.push({ title, subTitle, img, tags, yearAndCountries, uid });
    });

    await Promise.all(moviePromises);
    return data;
}

// Получение дополнительных данных со второго сайта
async function fetchAdditionalData(uid) {
    const url = `https://www.kinoafisha.info/movies/${uid}/#submenu`;
    const $ = await fetchAndParse(url);
    return {
        details: $('.visualEditorInsertion p').text().trim() || $('.visualEditorInsertion section section article section').text().trim(),
        rating: $('.ratingBlockCard  .ratingBlockCard_content .ratingBlockCard_info .ratingBlockCard_values .ratingBlockCard_local').text().trim(),
        ratingIMDb: $('.ratingBlockCard  .ratingBlockCard_content .ratingBlockCard_info .ratingBlockCard_values .ratingBlockCard_externalList .ratingBlockCard_externalItem .ratingBlockCard_externalVal').text().trim()
    };
}



async function fetchCinemaData(uid) {
    const url = `https://nn.kinoafisha.info/movies/${uid}/#schedule`;
    const $ = await fetchAndParse(url);
    const cinemas = [];

    // Извлечение данных о кинотеатрах
    const cinemaPromises = $('.showtimes_item').map(async (index, element) => {
        const nameKinoteatr = $(element).find('.showtimesCinema_name').text().trim();
        const addrKinoteatr = $(element).find('.showtimesCinema_addr').text().trim() || 
            `Метро ${$(element).find('.showtimesCinema_metro .showtimesCinema_metroItem').text().trim()}`;

        const sessionPromises = $(element).find('.showtimes_cell').map(async (index, cellElement) => {
            const format = $(cellElement).find('.showtimes_format').text().trim();
            const sessionsTimeAndPrice = [];

            // Извлечение данных о сеансах
            $(cellElement).find('.showtimes_sessions .showtimes_session').each((index, sessionElement) => {
                const sessionsTime = $(sessionElement).find('.session_time').text().trim();
                const sessionsPrice = $(sessionElement).find('.session_price').text().trim() || "";
                if (sessionsTime) {
                    sessionsTimeAndPrice.push({ sessionsTime, sessionsPrice });
                }
            });

            // Возвращаем формат и данные о сеансах только если они есть
            if (sessionsTimeAndPrice.length > 0) {
                return { format, sessions: sessionsTimeAndPrice };
            } else {
                return null; // Возвращаем null, если нет сеансов
            }
        });

        // Ждем завершения всех промисов для сеансов
        const formatsAndSessions = await Promise.all(sessionPromises);

        // Фильтруем null значения и добавляем данные о кинотеатре только если есть сеансы
        const dopinfa = formatsAndSessions.filter(format => format !== null);
        if (dopinfa.length > 0) {
            cinemas.push({ nameKinoteatr, addrKinoteatr, ...dopinfa });
        }
    });

    // Ждем завершения всех промисов для кинотеатров
    await Promise.all(cinemaPromises);
    return cinemas;
}
// Основная функция для парсинга KinoAfisha
async function parseKinoAfisha() {
    const combinedDataArray = [];
    const firstSiteData = await fetchDataFromFirstSite();

    const dataPromises = firstSiteData.map(async (item) => {
        const additionalData = await fetchAdditionalData(item.uid);
        
        const cinemaData = await fetchCinemaData(item.uid);
        
        combinedDataArray.push({ ...item, ...additionalData, dopInfa: cinemaData });
    });

    await Promise.all(dataPromises);
    await Events.findOneAndUpdate({}, { kino: combinedDataArray }, { new: true, upsert: true });
}

// Вспомогательная функция для парсинга новостей
const helpParseNews = asyncHandler(async (urlNews) => {
    const $ = await fetchAndParse(urlNews);
    return $(`.single-news__text p`).text().trim();
});

// Функция для парсинга новостей
const parseNews = asyncHandler(async (req, res) => {
    const url = 'https://nobl.ru/novosti-nizhegorodskoj-oblasti-za-vse-vremya/?page=1';
    const $ = await fetchAndParse(url);
    const data = [];

    const newsPromises = $('.news-page__inner .news-card-common').map(async (index, element) => {
        const title = $(element).find('.news-card-common__inner .news-card-common__title').text().trim();
        const tag = $(element).find('.news-card-common__inner .news-card-common__tags .tag-common').first().text().trim() || "Новости";
        const img = `https://nobl.ru${$(element).find('.news-card-common__img-wrap picture .news-card-common__img').attr('data-src')}`;
        const dataNews = `${$(element).find('.news-card-common__inner .news-card-common__date-time .news-card-common__date').text().trim()} ${$(element).find('.news-card-common__inner .news-card-common__date-time .news-card-common__time').text().trim()}`;
        const ssl = `https://nobl.ru${$(element).attr('href')}`;

        data.push({ title, tag, img, dataNews, ssl });
    });

    await Promise.all(newsPromises);

    const massPolnNews = await Promise.all(data.map(async (item) => {
        const text = await helpParseNews(item.ssl);
        return { text, uid: uuidv4() };
    }));

    const result = data.map((item, index) => ({ ...item, ...massPolnNews[index] }));
    await Events.findOneAndUpdate({}, { news: result }, { new: true, upsert: true });
});

// Функция для парсинга IT-событий
const parseIt = asyncHandler(async (req, res) => {
    const url = 'https://www.it52.info/';
    const $ = await fetchAndParse(url);
    const data = [];

    const eventPromises = $('.event').map(async (index, element) => {
        const title = $(element).find('.panel-body .row .col-sm-12 .event-header a').text().trim();
        const date = `${$(element).find('.panel-body .row .col-sm-12 .event-subheader span .event-date-inversed .event-day').text().trim()} ${$(element).find('.panel-body .row .col-sm-12 .event-subheader span .event-date-inversed .event-time').text().trim()}`;
        const addr = `${$(element).find('.panel-body .row .col-sm-12 .event-subheader span a [itemprop=address]').text().trim()} ${$(element).find('.panel-body .row .col-sm-12 .event-subheader span a [itemprop=name]').text().trim()}`;
        const img = $(element).find('.panel-body .row .col-sm-4 a .image-container img').attr('src');
        const organizator = $(element).find('.panel-body .row .col-sm-4 .event-organizer p a').text().trim();
        const tags = $(element).find('.panel-body .row .col-sm-4 .event-tags p a').first().text().trim() || 'IT';
        const Fulltext = $(element).find('.panel-body .row .col-sm-8 .event-description p').text().trim();
        const upFlText = Fulltext.replace(/\\n/g, '\n').replace(/\[at\]/g, '')
            .replace(/\[dot\]/g, '')
            .replace(/\[email\s*protected\]/g, '')
            .replace(/\s+/g, ' ') // Убираем лишние пробелы
            .trim();

        data.push({ title, date, addr, img, organizator, tags, upFlText, uid: uuidv4() });
    });

    await Promise.all(eventPromises);
    await Events.findOneAndUpdate({}, { it: data }, { new: true, upsert: true });
});

// Экспорт функций
module.exports = {
    parseKinoAfisha,
    parseNews,
    parseIt,
    // Добавьте другие функции, если необходимо
};