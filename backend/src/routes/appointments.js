const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { create, listByPatient } = require('../controllers/appointmentController');

router.use(verifyToken);

router.post('/', create);
router.get('/patient/:patient_id', listByPatient);

module.exports = router;
