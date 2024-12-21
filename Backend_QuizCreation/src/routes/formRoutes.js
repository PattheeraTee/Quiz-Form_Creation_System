// File: routes/formRoutes.js
const express = require('express');
const router = express.Router();
const formController = require('../controller/formController');

// เส้นทางสำหรับดึงข้อมูลแบบฟอร์ม
router.get('/:formId', formController.getForm);

// เส้นทางสำหรับสร้างแบบฟอร์มใหม่
router.post('/create', formController.createForm);

module.exports = router;