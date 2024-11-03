const asyncHandler = require("express-async-handler");
const axios = require('axios');
const cheerio = require('cheerio');

const parseKinoAfisha = asyncHandler(async (req, res) => {
    const movies = [];
    const url = 'https://nn.kinoafisha.info/movies/';



    const site1 = [];
    try {
        const { data: site1Data } = await axios.get(url);
        const $site1 = cheerio.load(site1Data);

        // Используем Promise.all для обработки всех фильмов асинхронно
        const moviePromises = $site1('.site_content .movies .grid_cell9 .movieList .movieList_item').map(async (index, element) => {
            const title = $site1(element).find('.movieItem_title').text().trim();
            const subTitle = $site1(element).find('.movieItem_subtitle').text().trim();
            const tags = $site1(element).find('.movieItem_details .movieItem_genres').text().trim();
            const yearAndContries = $site1(element).find('.movieItem_details .movieItem_year').text().trim();
            const img = $site1(element).find('.movieItem_poster .picture_image').attr('data-picture');
            const uid = JSON.parse($site1(element).find('.movieItem_actions .movieItem_favBtn').attr('data-param')).uid;


            site1.push({
                title,
                subTitle,
                img,
                tags,
                yearAndContries,
                uid,
            });
        })

        const site2 = [];
        for (item of site1) {
            const { data: site2Data } = await axios.get(`https://nn.kinoafisha.info/movies/`);
            const $site2 = cheerio.load(site2Data);

            // Используем Promise.all для обработки всех фильмов асинхронно
            const moviePromises = $site2('.site_content .movies .grid_cell9 .movieList .movieList_item').map(async (index, element) => {
                const title = $site2(element).find('.movieItem_title').text().trim();
                const subTitle = $site2(element).find('.movieItem_subtitle').text().trim();
                const tags = $site2(element).find('.movieItem_details .movieItem_genres').text().trim();
                const yearAndContries = $site2(element).find('.movieItem_details .movieItem_year').text().trim();
                const img = $site2(element).find('.movieItem_poster .picture_image').attr('data-picture');
                const uid = JSON.parse($site2(element).find('.movieItem_actions .movieItem_favBtn').attr('data-param')).uid;


                site2.push({
                    title,
                    subTitle,
                    img,
                    tags,
                    yearAndContries,
                    uid,
                });
            })
        }


        res.status(200).json(site1);
    }  catch (err) {
                res.status(400).json({
                    message: "Error parsing"
                })
        console.log(err)
        }

});


module.exports = {
    parseKinoAfisha,
}
