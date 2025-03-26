const express = require('express');
const responseController = require('../controller/responseController');

const router = express.Router();

// สร้าง Response ใหม่
router.post('/submit', responseController.submitResponse);

// ดึง Responses ที่เกี่ยวข้องกับ Form
router.get('/form/:formId', responseController.getResponsesByForm);

// ลบ Responses
router.delete('/delete', responseController.deleteResponses);

// ดึง responses detail แสดงในตาราง
router.get("/form/:formId/detail", responseController.getDetailResponses);

module.exports = router;
