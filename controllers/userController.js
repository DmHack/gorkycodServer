const jwt = require("jsonwebtoken");
const axios = require("axios");
const Cryptr = require("cryptr");
const asyncHandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
//--------------------------------
const Users = require("../models/userModel");
const cryptr = new Cryptr(process.env.CRYPTR);

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400).json({
            message: 'Please add all fields'
        });
    }

    const userExists = await Users.findOne({ email });

    if (userExists) {
        res.status(400).json({
            message: 'User already exists'
        })
    }

    const salt = await bcrypt.genSalt(10);
    const handlePassword = await bcrypt.hash(password, salt);

    const user = await Users.create({
        name,
        email,
        password: handlePassword
    })

    if (user) {
        res.status(200).json({
            message: 'User successfully created'
        })
    } else {
        res.status(400).json({
            message: 'invalid user data'
        })
    }
})


const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await Users.findOne({email});

    if (user && (await bcrypt.compare(password, user.password))) {
        const refresh = generateRefreshToken(user._id);
        Users.findOneAndUpdate({ _id: user._id }, { refresh: cryptr.encrypt(refresh) }, { new: true })
            .then(function () {
                res.cookie('access', cryptr.encrypt(generateAccessToken(user._id)), {
                    sameSite: 'none',
                    secure: false,
                    httpOnly: true,
                })
                res.cookie('refresh', cryptr.encrypt(refresh), {
                    sameSite: 'none',
                    secure: false,
                    httpOnly: true,
                })
                res.status(200).json({
                    message: 'login successfull'
                })
            })
            .catch(function (err) {
                res.status(400).json({
                    message: 'Error in login'
                })
            });


    } else {
        // res.status(400)
        // throw new Error('User arleady exists')
        res.status(400).json({
            message: `Invalid credentials`
        })
    }
})

const getMe = asyncHandler(async (req, res) => {
    const id = jwt.decode(cryptr.decrypt(req.cookies.access)).id;
    const { name, _id, email } = await Users.findById(id);

    res.status(200).json({
        name,
        id: _id,
        email
    });
})



const renewAccessToken = asyncHandler(async (req, res) => {
    const refreshToken = cryptr.decrypt(req.cookies.refresh);

    if (!refreshToken) {
        return res.status(405).json({ message: "User not authenticated" })
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH, async (err, user) => {

        if (!err) {
            const { refresh } = await Users.findById(user.id);
            try {
                const refreshDec = cryptr.decrypt(refresh)
                if (refreshToken === refreshDec) {
                    res.cookie('access', cryptr.encrypt(generateAccessToken(user.id)), {
                        httpOnly: true,
                        sameSite: 'None',
                        secure: false
                    })
                    res.status(201).json({ message: 'ok' })
                } else {
                    res.clearCookie('access');
                    res.clearCookie('refresh');
                    res.status(405).json({ message: "Token invalid", err: err });
                }

            } catch (err) {
                res.status(405).json({
                    message: 'NO'
                })
            }

        } else {
            res.clearCookie('access');
            res.clearCookie('refresh');
            res.status(405).json({ message: "User not authenticated", err: err });
        }
    })
})





const resetPassword = asyncHandler(async (req, res) => {

})









const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET_ACCESS, {
        expiresIn: '100m',
    })
}

const generateRefreshToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET_REFRESH, {
        expiresIn: '30d',
    })
}

module.exports = {
    registerUser,
    login,
    getMe,
    renewAccessToken
};
