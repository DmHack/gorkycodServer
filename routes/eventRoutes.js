const express = require('express');
// -------------------------------
const { protect } = require('../middleware/authMiddleware');
const { kinoPrint, newsPrint} = require('../controllers/eventController')
const router = express.Router();

// POST


// GET
router.get('/kinoPrint', protect, kinoPrint);
router.get('/newsPrint', protect, newsPrint);


module.exports = router;