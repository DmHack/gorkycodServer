const express = require('express');
// -------------------------------
const { registerUser, login, getMe, renewAccessToken} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// POST
router.post('/register', registerUser);
router.post('/login', login);

// GET
router.get('/getMe', protect, getMe);
router.get('/renewAccessToken', renewAccessToken);

module.exports = router;