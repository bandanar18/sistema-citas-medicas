const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { daily } = require('../controllers/reportController');

router.use(verifyToken);

router.get('/daily', daily);

module.exports = router;
