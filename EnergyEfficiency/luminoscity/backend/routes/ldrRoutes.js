const express = require('express');
const router = express.Router();
const { getCurrentLDRStatus } = require('../controllers/ldrController');

router.get('/ldr/status', getCurrentLDRStatus);

module.exports = router;
