const asyncHandler = require("express-async-handler");
// ------------------
const Kino = require('../models/kinoModels')

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



module.exports = {
    kinoPrint,
}
