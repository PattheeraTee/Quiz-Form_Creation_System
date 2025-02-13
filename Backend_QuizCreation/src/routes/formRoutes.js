// File: routes/formRoutes.js
const express = require('express');
const router = express.Router();
const formController = require('../controller/formController');

// ดึง Forms ทั้งหมดของ User
router.get('/user/:userId', formController.getFormsByUser);

// เส้นทางสำหรับดึงข้อมูลแบบฟอร์
router.get('/:formId', formController.getForm);
// เส้นทางสำหรับสร้างแบบฟอร์มใหม่
router.post('/create', formController.createForm);
// เส้นทางสำหรับแก้ไขข้อมูลแบบฟอร์ม
router.patch('/:formId', formController.updateForm); 
// ลบ Form
router.delete('/:formId', formController.deleteForm);

// อัปเดต Coverpage
router.patch('/coverpage/:coverpageId', formController.updateCoverpage);

// แก้ไข Theme
router.patch('/theme/:themeId', formController.editTheme);

// เส้นทางสำหรับเพิ่ม แก้ไข และลบข้อมูลของแต่ละส่วน
router.post('/:formId/sections', formController.addSection);
router.patch('/:formId/sections/:sectionId', formController.editSection);
router.delete('/:formId/sections/:sectionId', formController.deleteSection);

// เส้นทางสำหรับเพิ่ม แก้ไข และลบข้อมูลของแต่ละคำถาม
router.post('/:sectionId/questions', formController.addQuestion);
router.patch('/:sectionId/questions/:questionId', formController.editQuestion);
router.delete('/:sectionId/questions/:questionId', formController.deleteQuestion);

// เส้นทางสำหรับเพิ่ม แก้ไข และลบข้อมูลของแต่ละตัวเลือก
router.post('/:questionId/options', formController.addOption);
router.patch('/:questionId/options/:optionId', formController.editOption);
router.delete('/:questionId/options/:optionId', formController.deleteOption);

module.exports = router;