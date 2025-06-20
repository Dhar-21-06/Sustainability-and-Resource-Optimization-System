const express = require('express');
const { handleMotion } = require('../controllers/pirControllers');

const router = express.Router();

router.post('/motion', handleMotion);

module.exports = router;
