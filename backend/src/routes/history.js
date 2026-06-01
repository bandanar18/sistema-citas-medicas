const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { getByDate } = require('../controllers/historyController');

router.use(verifyToken);

router.get('/', getByDate);

module.exports = router;
