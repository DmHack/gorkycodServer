const express = require('express');
// -------------------------------
const { protect } = require('../middleware/authMiddleware');
const { eventPrint, poiskEvents} = require('../controllers/eventController')
const router = express.Router();




// POST
router.post('/poiskEvents', protect, poiskEvents);
router.post('/eventPrint', protect, eventPrint);

module.exports = router;