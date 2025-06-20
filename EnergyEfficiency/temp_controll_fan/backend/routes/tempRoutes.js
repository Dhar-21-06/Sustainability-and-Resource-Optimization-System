// EnergyEfficiency/temperature/backend/routes/tempRoutes.js

const express = require('express');
const router = express.Router();
const { pushTemperatureData } = require('../controllers/tempController');

router.post('/data', pushTemperatureData);

module.exports = router;
