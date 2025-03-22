const express = require('express');
const router = express.Router();
const geminiController = require('../controller/geminiController');
const dataController = require('../controller/dataController');

router.post('/generate-quiz', geminiController.generateQuizForm);
// router.post('/test-generate-quiz', geminiController.testgen);

//get data
router.get('/languages', dataController.getLanguages);

router.get('/education-levels', dataController.getEducationLevels);

module.exports = router;