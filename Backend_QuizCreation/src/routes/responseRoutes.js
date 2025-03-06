const express = require('express');
const responseController = require('../controller/responseController');

const router = express.Router();

// สร้าง Response ใหม่
router.post('/submit', responseController.submitResponse);

// ดึง Responses ที่เกี่ยวข้องกับ Form
router.get('/form/:formId', responseController.getResponsesByForm);

// ลบ Responses
router.delete('/delete', responseController.deleteResponses);

// ตรวจสอบว่าอีเมลเคยตอบแบบฟอร์มนี้หรือยัง
router.get("/form/:formId/check", responseController.checkUserResponse);

// ดึง Responses ทั้งหมดที่เกี่ยวข้องกับ Form (รวมทุกคำตอบ)
router.get('/form/:formId/all', responseController.getAllResponsesByForm);

module.exports = router;
