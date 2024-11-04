const asyncHandler = require("express-async-handler");
// ------------------
const Kino = require('../models/kinoModels')
const News = require("../models/newsModel");
const kinoPrint = asyncHandler(async (req, res) => {
    const kino = await Kino.find({});

    if (kino) {
        res.status(200).json(kino[0].kino)
    } else {
        res.status(200).json({
            message: "Error kinoPrint"
        })
    }
})

const newsPrint = asyncHandler(async (req, res) => {
    const kino = await News.find({});

    if (kino) {
        res.status(200).json(kino[0].news)
    } else {
        res.status(200).json({
            message: "Error kinoPrint"
        })
    }
})



module.exports = {
    kinoPrint,
    newsPrint
}
