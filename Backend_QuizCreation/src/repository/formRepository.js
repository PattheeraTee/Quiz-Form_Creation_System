const Form = require('../models/form');
const Coverpage = require('../models/coverpage');
const Theme = require('../models/theme');
const Section = require('../models/section');
const Question = require('../models/question');
const Result = require('../models/result');
const Response = require('../models/response');

// ---------- ฟังก์ชันสำหรับการตรวจสอบข้อมูล ----------
// ตรวจสอบว่ามีแบบฟอร์มอยู่ในฐานข้อมูล
exports.validateFormExistence = async (formId) => {
    const form = await Form.findOne({ form_id: formId });
    if (!form) {
        throw new Error('Form not found');
    }
    return form;
};

// ตรวจสอบว่า Coverpage มีอยู่ในฐานข้อมูลหรือไม่
exports.validateCoverpageExistence = async (coverpageId) => {
    const coverpage = await Coverpage.findOne({ cover_page_id: coverpageId });
    if (!coverpage) {
        throw new Error('Coverpage not found');
    }
    return coverpage;
};

// ตรวจสอบว่ามี Section อยู่ในฐานข้อมูลหรือไม่
exports.validateSectionExistence = async (sectionId) => {
    const section = await Section.findOne({ section_id: sectionId });
    if (!section) {
        throw new Error('Section not found');
    }
    return section;
};

// ตรวจสอบว่า Section เป็นของ Form ที่กำหนดหรือไม่
exports.validateSectionBelongsToForm = async (formId, sectionId) => {
    const section = await Section.findOne({ section_id: sectionId, form_id: formId });
    if (!section) {
        throw new Error(`Section ${sectionId} does not belong to Form ${formId}`);
    }
    return section;
};

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

// ตรวจสอบการมีอยู่ของ Theme
exports.validateThemeExistence = async (themeId) => {
    const theme = await Theme.findOne({ theme_id: themeId });
    if (!theme) {
        throw new Error('Theme not found');
    }
    return theme;
};

// ---------- ฟังก์ชันสำหรับการจัดการข้อมูล ----------
// ********** Form **********
exports.createForm = async (formData) => {
    const form = new Form(formData);
    await form.save();
    return form;
};

exports.updateForm = async (formId, updateData) => {
    return await Form.findOneAndUpdate({ form_id: formId }, updateData, { new: true });
};

// ลบ Form
exports.deleteForm = async (formId) => {
    await Form.deleteOne({ form_id: formId });
};

// ลบ Coverpage
exports.deleteCoverpage = async (coverPageId) => {
    await Coverpage.deleteOne({ cover_page_id: coverPageId });
};

// ลบ Sections
exports.deleteSections = async (sectionIds) => {
    await Section.deleteMany({ section_id: { $in: sectionIds } });
};

// ลบ Results
exports.deleteResults = async (resultIds) => {
    await Result.deleteMany({ result_id: { $in: resultIds } });
};

// ลบ Theme
exports.deleteTheme = async (themeId) => {
    await Theme.deleteOne({ theme_id: themeId });
};

// ลบ Responses
exports.deleteResponses = async (responseIds) => {
    await Response.deleteMany({ response_id: { $in: responseIds } });
};

// ฟังก์ชันสำหรับจัดการ Coverpage
exports.createCoverpage = async (coverpageData) => {
    const coverpage = new Coverpage(coverpageData);
    await coverpage.save();
    return coverpage;
};

// ฟังก์ชันสำหรับจัดการ Theme
exports.createTheme = async (themeData) => {
    const theme = new Theme(themeData);
    await theme.save();
    return theme;
};

// ฟังก์ชันสำหรับจัดการ Section
exports.createSection = async (sectionData) => {
    const section = new Section(sectionData);
    await section.save();
    return section;
};

// อัปเดตข้อมูลในแบบฟอร์ม
exports.updateForm = async (formId, updateData) => {
    const updatedForm = await Form.findOneAndUpdate(
        { form_id: formId },
        { $set: updateData },
        { new: true }
    );
    if (!updatedForm) {
        throw new Error('Failed to update form');
    }
    return updatedForm;
};

// ดึงข้อมูลฟอร์ม
exports.getForm = async (formId) => {
    return await Form.findOne({ form_id: formId });
};

// ดึงข้อมูล Coverpage
exports.getCoverpage = async (formId) => {
    return await Coverpage.findOne({ form_id: formId });
};

// ดึงข้อมูล Theme
exports.getTheme = async (formId) => {
    return await Theme.findOne({ form_id: formId });
};

// ดึงข้อมูล Sections
exports.getSections = async (formId) => {
    return await Section.find({ form_id: formId }).sort({ number: 1 }).lean();
};

// ดึงข้อมูล Questions
exports.getQuestionsBySection = async (sectionId) => {
    return await Question.find({ section_id: sectionId }).lean();
};

// ********** Coverpage **********
// อัปเดต Coverpage
exports.updateCoverpage = async (coverpageId, updateData) => {
    const updatedCoverpage = await Coverpage.findOneAndUpdate(
        { cover_page_id: coverpageId },
        { $set: updateData },
        { new: true }
    );
    if (!updatedCoverpage) {
        throw new Error('Failed to update coverpage');
    }
    return updatedCoverpage;
};

// ********** Section **********
// ค้นหา Section ที่มีหมายเลขสูงสุดในฟอร์ม
exports.getMaxSectionNumber = async (formId) => {
    return await Section.findOne({ form_id: formId }).sort({ number: -1 });
};

// สร้าง Section ใหม่
exports.createSection = async (sectionData) => {
    const section = new Section(sectionData);
    await section.save();
    return section;
};

// เพิ่ม Section ID ลงในฟอร์ม
exports.addSectionToForm = async (formId, sectionId) => {
    await Form.updateOne(
        { form_id: formId },
        { $push: { section_id: sectionId } }
    );
};

// อัปเดต Section
exports.updateSection = async (sectionId, sectionData) => {
    const updatedSection = await Section.findOneAndUpdate(
        { section_id: sectionId },
        { $set: sectionData },
        { new: true }
    );
    if (!updatedSection) {
        throw new Error('Failed to update section');
    }
    return updatedSection;
};

// ลบ Section
exports.deleteSection = async (sectionId) => {
    await Section.deleteOne({ section_id: sectionId });
};

// ลบ Section ID ออกจาก Form
exports.removeSectionFromForm = async (formId, sectionId) => {
    await Form.updateOne(
        { form_id: formId },
        { $pull: { section_id: sectionId } }
    );
};

// ดึง Sections ทั้งหมดใน Form
exports.getSectionsByForm = async (formId) => {
    return await Section.find({ form_id: formId }).sort({ number: 1 });
};

// อัปเดตหมายเลข Section
exports.updateSectionNumber = async (section) => {
    await section.save();
};

// ********** Question **********
// เพิ่ม Question
exports.createQuestion = async (questionData) => {
    const question = new Question(questionData);
    await question.save();
    return question;
};

// เพิ่ม Question ID ลงใน Section
exports.addQuestionToSection = async (sectionId, questionId) => {
    await Section.updateOne(
        { section_id: sectionId },
        { $push: { questions: questionId } }
    );
};

// อัปเดต Question
exports.updateQuestion = async (questionId, questionData) => {
    const updatedQuestion = await Question.findOneAndUpdate(
        { question_id: questionId },
        { $set: questionData },
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

// ลบ Question ID จาก Section
exports.removeQuestionFromSection = async (sectionId, questionId) => {
    await Section.updateOne(
        { section_id: sectionId },
        { $pull: { questions: questionId } }
    );
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

// แก้ไข Option ใน Question
exports.updateOption = async (questionId, optionId, optionData) => {
    const updatedQuestion = await Question.findOneAndUpdate(
        { question_id: questionId, 'options.option_id': optionId },
        { $set: { 'options.$': optionData } }, // อัปเดตทั้ง object ของ option
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

// *********** Theme ***********
// แก้ไข Theme
exports.updateTheme = async (themeId, themeData) => {
    const updatedTheme = await Theme.findOneAndUpdate(
        { theme_id: themeId },
        { $set: themeData },
        { new: true } // ส่งข้อมูลที่อัปเดตแล้วกลับมา
    );
    if (!updatedTheme) {
        throw new Error('Failed to update theme');
    }
    return updatedTheme;
};

// ---------- ฟังก์ชันสำหรับการดึงข้อมูลของ user ----------
// ดึง Forms ทั้งหมดของ User
exports.getFormsByUserId = async (userId) => {
    return await Form.find({ user_id: userId }).lean();
};

// ดึง Coverpage ที่เกี่ยวข้องกับ Form
exports.getCoverpagesByFormIds = async (formIds) => {
    return await Coverpage.find({ form_id: { $in: formIds } }).lean();
};
