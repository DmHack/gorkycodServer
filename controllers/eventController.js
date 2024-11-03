const asyncHandler = require("express-async-handler");
const axios = require('axios');
const cheerio = require('cheerio');

const parseKinoAfisha = asyncHandler(async (req, res) => {
    const movies = [];
    const url = 'https://nn.kinoafisha.info/movies/';

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Используем Promise.all для обработки всех фильмов асинхронно
        const moviePromises = $('.site_content .movies .grid_cell9 .movieList .movieList_item').map(async (index, element) => {
            const title = $(element).find('.movieItem_title').text().trim();
            const subTitle = $(element).find('.movieItem_subtitle').text().trim();
            const tags = $(element).find('.movieItem_details .movieItem_genres').text().trim();
            const yearAndContries = $(element).find('.movieItem_details .movieItem_year').text().trim();
            const img = $(element).find('.movieItem_poster .picture_image').attr('data-picture');
            const uid = JSON.parse($(element).find('.movieItem_actions .movieItem_favBtn').attr('data-param')).uid;


            movies.push({
                title,
                subTitle,
                img,
                tags,
                yearAndContries,
                uid,
            });
        })

        res.status(200).json(movies);

    } catch (error) {
        console.error('Ошибка при парсинге данных:', error.message);
        res.status(400).json({
            message: "Error parsing"
        });
    }
});


module.exports = {
    parseKinoAfisha,
}
