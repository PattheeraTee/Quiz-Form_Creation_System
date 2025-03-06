const express = require('express');
const router = express.Router();
const geminiController = require('../controller/geminiController');
const dataController = require('../controller/dataController');

router.post('/generate-quiz', geminiController.generateQuizForm);

//get data
router.get('/languages', dataController.getLanguages);

module.exports = router;