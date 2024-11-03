const jwt = require('jsonwebtoken');
const asyncHandle = require('express-async-handler');
const Cryptr = require('cryptr');
// --------------------------------

const cryptr = new Cryptr(process.env.CRYPTR);

const protect = asyncHandle(async (req, res, next) => {
    let token;
    if (req.cookies.access) {
        try {
            token = cryptr.decrypt(req.cookies.access)
            jwt.verify(token, process.env.JWT_SECRET_ACCESS)

            next()
        } catch (error) {
            res.status(402)
            throw new Error(`Not authorized, ${error}`)
        }
    }
    else if (!token) {
        res.status(401)
        throw new Error('Not authorized, no token')
    }
})

module.exports = { protect }