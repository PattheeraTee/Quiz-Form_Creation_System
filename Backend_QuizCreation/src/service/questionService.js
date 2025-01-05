const { filterRestrictedFields } = require('../utils/filterRestrictedFields');
const { questionRestrictedFields, optionRestrictedFields } = require('../constants/restrictedFields');
const sectionRepository = require('../repository/sectionRepository');
const questionRepository = require('../repository/questionRepository');

// ********** Question **********
// เพิ่มคำถาม
exports.addQuestion = async (sectionId, questionData) => {
    try {
        // ตรวจสอบว่า Section มีอยู่
        await sectionRepository.validateSectionExistence(sectionId);

        // สร้าง Question
        const question = await questionRepository.createQuestion({
            section_id: sectionId,
            ...questionData,
        });

        // เพิ่ม Question ID ลงใน Section
        await sectionRepository.addQuestionToSection(sectionId, question.question_id);

        // ส่งคืน Question ที่สร้าง
        return question;
    } catch (error) {
        throw new Error(`Error adding question: ${error.message}`);
    }
};

// แก้ไขคำถาม
exports.editQuestion = async (sectionId, questionId, questionData) => {
    try {
        // ตรวจสอบว่า Section มีอยู่
        await sectionRepository.validateSectionExistence(sectionId);

        // ตรวจสอบว่า Question มีอยู่
        await questionRepository.validateQuestionExistence(questionId);

        // ตรวจสอบว่า Question อยู่ใน Section ที่กำหนด
        await questionRepository.validateQuestionInSection(sectionId, questionId);

        // กรองฟิลด์ต้องห้าม
        const updateFields = filterRestrictedFields(questionData, questionRestrictedFields);

        if (Object.keys(updateFields).length === 0) {
            throw new Error('No valid fields to update');
        }

        // อัปเดต Question
        const updatedQuestion = await questionRepository.updateQuestion(questionId, updateFields);

        // ส่งคืน Question ที่อัปเดตแล้ว
        return updatedQuestion;
    } catch (error) {
        throw new Error(`Error editing question: ${error.message}`);
    }
};

// ลบคำถาม
exports.deleteQuestion = async (sectionId, questionId) => {
    try {
        // ตรวจสอบการมีอยู่ของ Section และ Question
        await sectionRepository.validateSectionExistence(sectionId);
        await questionRepository.validateQuestionExistence(questionId);

        // ตรวจสอบว่า Question อยู่ใน Section ที่กำหนด
        await questionRepository.validateQuestionInSection(sectionId, questionId);

        // ลบ Question
        await questionRepository.deleteQuestion(questionId);

        // ลบ Question ID ออกจาก Section
        await sectionRepository.removeQuestionFromSection(sectionId, questionId);

        // ส่งข้อความยืนยันการลบ
        return { message: 'Question deleted' };
    } catch (error) {
        throw new Error(`Error deleting question: ${error.message}`);
    }
};

// ********** Option **********
// เพิ่มตัวเลือก
exports.addOption = async (questionId, optionData) => {
    try {
        // ตรวจสอบว่า Question มีอยู่
        await questionRepository.validateQuestionExistence(questionId);

        // เพิ่ม Option ใน Question
        const updatedQuestion = await questionRepository.addOptionToQuestion(questionId, optionData);

        // ส่งคืน Question ที่อัปเดตแล้ว
        return updatedQuestion;
    } catch (error) {
        throw new Error(`Error adding option: ${error.message}`);
    }
};

// แก้ไขตัวเลือก
exports.editOption = async (questionId, optionId, optionData) => {
    try {
        // ตรวจสอบว่า Question มีอยู่
        await questionRepository.validateQuestionExistence(questionId);

        // ตรวจสอบว่า Option มีอยู่ใน Question
        await questionRepository.validateOptionExistence(questionId, optionId);

        // กรองฟิลด์ต้องห้าม
        const updateFields = filterRestrictedFields(optionData, optionRestrictedFields);

        if (Object.keys(updateFields).length === 0) {
            throw new Error('No valid fields to update');
        }

        // อัปเดต Option
        const updatedQuestion = await questionRepository.updateOption(questionId, optionId, updateFields);

        return updatedQuestion;
    } catch (error) {
        throw new Error(`Error editing option: ${error.message}`);
    }
};

// ลบ option
exports.deleteOption = async (questionId, optionId) => {
    try {
        // ตรวจสอบว่า Question มีอยู่
        await questionRepository.validateQuestionExistence(questionId);

        // ตรวจสอบว่า Option มีอยู่ใน Question
        await questionRepository.validateOptionExistence(questionId, optionId);

        // ลบ Option ใน Question
        const updatedQuestion = await questionRepository.deleteOption(questionId, optionId);

        // ส่งคืน Question ที่อัปเดตแล้ว
        return updatedQuestion;
    } catch (error) {
        throw new Error(`Error deleting option: ${error.message}`);
    }
};