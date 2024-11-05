const asyncHandler = require("express-async-handler");
// ------------------
const Events = require('../models/eventsModels')

const kinoPrint = asyncHandler(async (req, res) => {
    const Event = await Events.find({});

    if (Event) {
        res.status(200).json(Event[0].kino)
    } else {
        res.status(200).json({
            message: "Error kinoPrint"
        })
    }
})

const newsPrint = asyncHandler(async (req, res) => {
    const Event = await Events.find({});

    if (Event) {
        res.status(200).json(Event[0].news)
    } else {
        res.status(200).json({
            message: "Error newsPrint"
        })
    }
})



module.exports = {
    kinoPrint,
    newsPrint
}
