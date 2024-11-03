const express = require('express');
// -------------------------------
const { protect } = require('../middleware/authMiddleware');
const { kinoPrint } = require('../controllers/eventController')
const router = express.Router();

// POST


// GET
router.get('/kinoPrint', protect, kinoPrint);


module.exports = router;