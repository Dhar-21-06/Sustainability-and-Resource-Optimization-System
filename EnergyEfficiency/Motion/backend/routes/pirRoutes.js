const express = require('express');
const router = express.Router();
const { getMotionStatus } = require('../controllers/pirController');

router.get('/status', getMotionStatus);

module.exports = router;
