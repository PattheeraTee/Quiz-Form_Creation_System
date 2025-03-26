const Question = require('../models/question');
const Form = require("../models/form");
const Section = require("../models/section");

// ---------- ฟังก์ชันสำหรับการตรวจสอบข้อมูล ----------
// ตรวจสอบการมีอยู่ของ Question
exports.validateQuestionExistence = async (questionId) => {
    const question = await Question.findOne({ question_id: questionId });
    if (!question) {
        throw new Error('Question not found');
    }
    return question;
};

// ตรวจสอบว่า Question อยู่ใน Section ที่กำหนด
exports.validateQuestionInSection = async (sectionId, questionId) => {
    const question = await Question.findOne({ question_id: questionId, section_id: sectionId });
    if (!question) {
        throw new Error('Question does not belong to the specified section');
    }
    return question;
};

// ตรวจสอบการมีอยู่ของ Option ใน Question
exports.validateOptionExistence = async (questionId, optionId) => {
    const question = await Question.findOne({ question_id: questionId, 'options.option_id': optionId });
    if (!question) {
        throw new Error('Option not found');
    }
    return question;
};

// ---------- ฟังก์ชันสำหรับการจัดการข้อมูล ----------
// ********** Form **********
// ดึงข้อมูล Questions
exports.getQuestionsBySection = async (sectionId) => {
    return await Question.find({ section_id: sectionId }).lean();
};

// ********** Section **********
// ลบ Questions ใน Section
exports.deleteQuestionsBySection = async (sectionId) => {
    await Question.deleteMany({ section_id: sectionId });
};

// ********** Question **********
// เพิ่ม Question ใน Section
exports.createQuestion = async (questionData) => {
    const question = new Question(questionData);
    await question.save();
    return question;
};

// อัปเดต Question
exports.updateQuestion = async (questionId, updateFields) => {
    const updatedQuestion = await Question.findOneAndUpdate(
        { question_id: questionId },
        { $set: updateFields },
        { new: true }
    );
    if (!updatedQuestion) {
        throw new Error('Failed to update question');
    }
    return updatedQuestion;
};

// ลบ Question
exports.deleteQuestion = async (questionId) => {
    await Question.deleteOne({ question_id: questionId });
};

// ดึง Question ตาม question_id
exports.getQuestionById = async (questionId) => {
    return await Question.findOne({ question_id: questionId }).lean();
};

// ดึง Question ตาม section_id
exports.getQuestionsBySectionId = async (sectionId) => {
    return await Question.find({ section_id: sectionId }).lean();
};

// ดึง Question ทั้งหมด ตาม form_id
exports.getAllQuestionsByFormId = async (formId) => {
    const form = await Form.findOne({ form_id: formId }).lean();
    if (!form) {
      throw new Error("Form not found");
    }
  
    const sectionIds = form.section_id;
  
    const sections = await Section.find({ section_id: { $in: sectionIds } }).lean();
  
    const result = [];
  
    for (const section of sections) {
      const questions = await Question.find({ section_id: section.section_id }).lean();
  
      result.push({
        section_id: section.section_id,
        section_title: section.title,
        questions: questions.map((q) => ({
          question_id: q.question_id,
          question: q.question,
          type: q.type,
          options: q.options || [], // ✅ ดึง options ตรงนี้ไว้ใช้ mapping option_id → text
        })),
      });
    }
  
    return result;
  };
  

// ********** Option **********
// เพิ่ม Option ใน Question
exports.addOptionToQuestion = async (questionId, optionData) => {
    const updatedQuestion = await Question.findOneAndUpdate(
        { question_id: questionId },
        { $push: { options: optionData } },
        { new: true }
    );
    if (!updatedQuestion) {
        throw new Error('Failed to add option to question');
    }
    return updatedQuestion;
};

// อัปเดต Option ใน Question
exports.updateOption = async (questionId, optionId, updateFields) => {
    // สร้าง `$set` เฉพาะฟิลด์ที่ผ่านการกรอง
    const setFields = Object.keys(updateFields).reduce((result, key) => {
        result[`options.$.${key}`] = updateFields[key];
        return result;
    }, {});

    const updatedQuestion = await Question.findOneAndUpdate(
        { question_id: questionId, 'options.option_id': optionId },
        { $set: setFields }, // อัปเดตเฉพาะฟิลด์ที่ผ่านการกรอง
        { new: true } // ส่งผลลัพธ์ใหม่กลับมา
    );

    if (!updatedQuestion) {
        throw new Error('Failed to update option');
    }

    return updatedQuestion;
};

// ลบ Option ใน Question
exports.deleteOption = async (questionId, optionId) => {
    const updatedQuestion = await Question.findOneAndUpdate(
        { question_id: questionId },
        { $pull: { options: { option_id: optionId } } }, // ลบ Option ที่ตรงกับ option_id
        { new: true } // ส่งผลลัพธ์ใหม่กลับมา
    );
    if (!updatedQuestion) {
        throw new Error('Failed to delete option');
    }
    return updatedQuestion;
};

