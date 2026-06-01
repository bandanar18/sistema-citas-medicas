const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { search, create, getById, update } = require('../controllers/patientController');

router.use(verifyToken);

router.get('/search', search);
router.post('/', create);
router.get('/:id', getById);
router.put('/:id', update);

module.exports = router;
