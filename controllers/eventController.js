const asyncHandler = require("express-async-handler");
// ------------------
const Events = require('../models/eventsModels')

const eventPrint = asyncHandler(async (req, res) => {
    const Event = await Events.find({});
    const nm = req.body.bdName;

    if (Event) {
        res.status(200).json(Event[0][nm])
    } else {
        res.status(400).json({
            message: "Error EventPrint"
        })
    }
})


const poiskEvents = asyncHandler(async (req, res) => {
    const uid = req.body.uid;
    const bdName = req.body.bdName;

    const event = await Events.findOne({ [`${bdName}.uid`]: uid }, { [`${bdName}.$`]: 1 });
    if (event) {
        res.status(200).json(event[bdName][0])
    } else {
        res.status(400).json({
            message: "poisk event error"
        })
    }
})


module.exports = {
    eventPrint,
    poiskEvents,

}
