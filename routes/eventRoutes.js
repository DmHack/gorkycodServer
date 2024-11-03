const express = require('express');
// -------------------------------
const { protect } = require('../middleware/authMiddleware');
const { parseKinoAfisha } = require('../controllers/eventController')
const router = express.Router();

// POST


// GET
router.get('/parseKinoAfisha', protect, parseKinoAfisha);


module.exports = router;