// File: repository/formRepository.js
const Form = require('../models/form');
const Coverpage = require('../models/coverpage');
const Theme = require('../models/theme');
const Section = require('../models/section');
const Question = require('../models/question');

// ตรวจสอบว่าข้อมูลมีอยู่จริงหรือไม่
exports.validateExistence = async (model, query, errorMessage) => {
    const result = await model.findOne(query);
    if (!result) {
        throw new Error(errorMessage);
    }
    return result;
};

// สร้าง Form
exports.createForm = async (formData) => {
    const form = new Form(formData);
    await form.save(); // ตรวจสอบว่าขั้นตอนนี้ไม่มีข้อผิดพลาด
    return form;
};

// สร้าง Coverpage
exports.createCoverpage = async (coverpageData) => {
    const coverPage = new Coverpage(coverpageData);
    await coverPage.save();
    return coverPage;
};

// สร้าง Theme
exports.createTheme = async (themeData) => {
    const theme = new Theme(themeData);
    await theme.save();
    return theme;
};

// สร้าง Section
exports.createSection = async (sectionData) => {
    const section = new Section(sectionData);
    await section.save();
    return section;
};

// ดึงข้อมูล Form
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
exports.getQuestions = async (sectionId) => {
    return await Question.find({ section_id: sectionId }).lean();
};

// อัปเดต Form
exports.updateForm = async (formId, updateData) => {
    await validateExistence(Form, { form_id: formId }, 'Form not found');
    try {
        const updatedForm = await Form.findOneAndUpdate(
            { form_id: formId },
            { $set: updateData },
            { new: true }
        );
        return updatedForm;
    } catch (error) {
        throw new Error(`Error updating form: ${error.message}`);
    }
};

// อัปเดต Coverpage
exports.updateCoverpage = async (coverpageId, updateData) => {
    await validateExistence(Coverpage, { cover_page_id: coverpageId }, 'Coverpage not found');
    try {
        const updatedCoverpage = await Coverpage.findOneAndUpdate(
            { cover_page_id: coverpageId },
            { $set: updateData },
            { new: true }
        );
        return updatedCoverpage;
    } catch (error) {
        throw new Error(`Error updating coverpage: ${error.message}`);
    }
};

// เพิ่ม Section
exports.addSection = async (sectionData) => {
    const section = new Section(sectionData);
    await section.save();
    return section;
};

// อัปเดต Section
exports.editSection = async (sectionId, sectionData) => {
    await validateExistence(Section, { section_id: sectionId }, 'Section not found');
    try {
        const updatedSection = await Section.findOneAndUpdate(
            { section_id: sectionId },
            { $set: sectionData },
            { new: true }
        );
        return updatedSection;
    } catch (error) {
        throw new Error(`Error updating section: ${error.message}`);
    }
};

// ลบ Section
exports.deleteSection = async (sectionId) => {
    await validateExistence(Section, { section_id: sectionId }, 'Section not found');
    try {
        await Section.deleteOne({ section_id: sectionId });
        return { message: 'Section deleted' };
    } catch (error) {
        throw new Error(`Error deleting section: ${error.message}`);
    }
};

// อัปเดต Sections ใน Form
exports.updateFormSections = async (formId, updateAction, sectionId) => {
    await validateExistence(Form, { form_id: formId }, 'Form not found');
    try {
        const updateQuery = updateAction === 'add'
            ? { $push: { section_id: sectionId } }
            : { $pull: { section_id: sectionId } };

        await Form.updateOne({ form_id: formId }, updateQuery);
    } catch (error) {
        throw new Error(`Error updating form sections: ${error.message}`);
    }
};

// ดึง Sections ของ Form
exports.getSectionsByFormId = async (formId) => {
    return await Section.find({ form_id: formId }).sort({ number: 1 });
};

// เพิ่ม Question
exports.addQuestion = async (questionData) => {
    const question = new Question(questionData);
    await question.save();
    return question;
};

// อัปเดต Question
exports.editQuestion = async (questionId, questionData) => {
    await validateExistence(Question, { question_id: questionId }, 'Question not found');
    try {
        const updatedQuestion = await Question.findOneAndUpdate(
            { question_id: questionId },
            { $set: questionData },
            { new: true }
        );
        return updatedQuestion;
    } catch (error) {
        throw new Error(`Error updating question: ${error.message}`);
    }
};

// ลบ Question
exports.deleteQuestion = async (questionId) => {
    await validateExistence(Question, { question_id: questionId }, 'Question not found');
    try {
        await Question.deleteOne({ question_id: questionId });
        return { message: 'Question deleted' };
    } catch (error) {
        throw new Error(`Error deleting question: ${error.message}`);
    }
};

// เพิ่ม Option
exports.addOption = async (questionId, optionData) => {
    await validateExistence(Question, { question_id: questionId }, 'Question not found');
    try {
        const updatedQuestion = await Question.findOneAndUpdate(
            { question_id: questionId },
            { $push: { options: optionData } },
            { new: true }
        );
        return updatedQuestion;
    } catch (error) {
        throw new Error(`Error adding option: ${error.message}`);
    }
};

// อัปเดต Option
exports.editOption = async (questionId, optionId, optionData) => {
    await validateExistence(Question, { question_id: questionId }, 'Question not found');
    try {
        const question = await Question.findOne({ question_id: questionId, 'options.option_id': optionId });
        if (!question) {
            throw new Error('Option not found');
        }

        const updatedQuestion = await Question.findOneAndUpdate(
            { question_id: questionId, 'options.option_id': optionId },
            { $set: { 'options.$.text': optionData.text } },
            { new: true }
        );

        return updatedQuestion;
    } catch (error) {
        throw new Error(`Error editing option: ${error.message}`);
    }
};

// ลบ Option
exports.deleteOption = async (questionId, optionId) => {
    await validateExistence(Question, { question_id: questionId }, 'Question not found');
    try {
        const updatedQuestion = await Question.findOneAndUpdate(
            { question_id: questionId },
            { $pull: { options: { option_id: optionId } } },
            { new: true }
        );
        return updatedQuestion;
    } catch (error) {
        throw new Error(`Error deleting option: ${error.message}`);
    }
};