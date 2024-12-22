// File: repo/formRepo.js
const Form = require('../models/form');
const Coverpage = require('../models/coverpage');
const Theme = require('../models/theme');
const Section = require('../models/section'); // ตรวจสอบให้แน่ใจว่าไฟล์ section.js มีการส่งออกโมเดล Section อย่างถูกต้อง
const Question = require('../models/question');

//ตรวจสอบว่าข้อมูลมีอยู่จริงหรือไม่
async function validateExistence(model, query, errorMessage) {
    const result = await model.findOne(query);
    if (!result) {
        throw new Error(errorMessage);
    }
    return result;
}

exports.createForm = async (data) => {
    try {
        // สร้างแบบฟอร์มใหม่แต่ยังไม่บันทึก
        const form = new Form({
            user_id: data.user_id,
            form_type: data.form_type,
            section_id: [], // เพิ่มค่าเริ่มต้นให้เป็น array ว่าง
            // result_id: [] // เพิ่มค่าเริ่มต้นให้เป็น array ว่าง
        });

        // สร้างหน้าปกค่าเริ่มต้น
        const coverPage = new Coverpage({
            form_id: form.form_id,
            title: 'Untitled Form'
        });
        await coverPage.save();

        // สร้างธีมค่าเริ่มต้น
        const theme = new Theme({
            form_id: form.form_id
        });
        await theme.save();

        // ดึงค่า number สูงสุดใน Section ของแบบฟอร์มนี้
        const maxSection = await Section.findOne({ form_id: form.form_id }).sort({ number: -1 });
        const nextNumber = maxSection ? maxSection.number + 1 : 1;

        // สร้าง section ค่าเริ่มต้น
        const section = new Section({
            form_id: form.form_id,
            title: 'Section 1',
            number: nextNumber // ตั้งค่า number สำหรับแบบฟอร์มนี้
        });
        await section.save();

        // เชื่อมโยงหน้าปก ธีม section กับแบบฟอร์ม
        form.cover_page_id = coverPage.cover_page_id;
        form.theme_id = theme.theme_id;
        form.section_id.push(section.section_id);

        // บันทึกแบบฟอร์มพร้อมข้อมูลที่เชื่อมโยง
        await form.save();

        return { form, coverPage, theme, section };
    } catch (error) {
        throw new Error(`เกิดข้อผิดพลาดในการสร้างแบบฟอร์ม: ${error.message}`);
    }
};

exports.getForm = async (formId) => {
    await validateExistence(Form, { form_id: formId }, 'Form not found');
    try {
        const form = await Form.findOne({ form_id: formId });
        if (!form) throw new Error('ไม่พบแบบฟอร์ม');

        const coverPage = await Coverpage.findOne({ form_id: formId });
        const theme = await Theme.findOne({ form_id: formId });
        // แก้ไขให้ดึงข้อมูล section ทั้งหมด
        const sections = await Section.find({ form_id: formId }).sort({ number: 1 });

        return { form, coverPage, theme, sections };
    } catch (error) {
        throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูลแบบฟอร์ม: ${error.message}`);
    }
};

//  * อัปเดตข้อมูลในแบบฟอร์ม
//  * @param {String} formId - รหัสของแบบฟอร์ม
//  * @param {Object} updateData - ข้อมูลที่ต้องการอัปเดต
//  * @returns {Object} - ข้อมูลที่อัปเดตแล้ว
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
        throw new Error(`เกิดข้อผิดพลาดในการอัปเดตแบบฟอร์ม: ${error.message}`);
    }
};

/**
 * อัปเดต Coverpage
 */
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

/**
 * เพิ่ม Section
 */
exports.addSection = async (formId, sectionData) => {
    await validateExistence(Form, { form_id: formId }, 'Form not found');
    try {
        const maxSection = await Section.findOne({ form_id: formId }).sort({ number: -1 });
        const nextNumber = maxSection ? maxSection.number + 1 : 1;
        const section = new Section({
            form_id: formId,
            title: sectionData.title || `Section ${nextNumber}`,
            number: nextNumber
        });
        await section.save();
        await Form.updateOne(
            { form_id: formId },
            { $push: { section_id: section.section_id } }
        );
        return section;
    } catch (error) {
        throw new Error(`เกิดข้อผิดพลาดในการเพิ่ม Section: ${error.message}`);
    }
};

/**
 * แก้ไข Section
 */
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
        throw new Error(`เกิดข้อผิดพลาดในการแก้ไข Section: ${error.message}`);
    }
};

/**
 * ลบ Section
 */
exports.deleteSection = async (formId, sectionId) => {
    await validateExistence(Form, { form_id: formId }, 'Form not found');
    await validateExistence(Section, { section_id: sectionId }, 'Section not found');
    try {
        // ลบ Section
        await Section.deleteOne({ section_id: sectionId });

        // ลบ Section ID จาก Form
        await Form.updateOne(
            { form_id: formId },
            { $pull: { section_id: sectionId } }
        );

        // ดึง Sections ที่เหลือและจัดเรียงใหม่
        const sections = await Section.find({ form_id: formId }).sort({ number: 1 });
        for (let i = 0; i < sections.length; i++) {
            sections[i].number = i + 1; // อัปเดตหมายเลขใหม่
            await sections[i].save();
        }

        return { message: 'Section deleted and numbers updated' };
    } catch (error) {
        throw new Error(`เกิดข้อผิดพลาดในการลบ Section: ${error.message}`);
    }
};

/**
 * เพิ่ม Question
 */
exports.addQuestion = async (sectionId, questionData) => {
    await validateExistence(Section, { section_id: sectionId }, 'Section not found');
    try {
        const question = new Question({
            section_id: sectionId, // เชื่อมโยงกับ Section
            ...questionData,      // ข้อมูลเพิ่มเติม เช่น type, options
        });
        await question.save(); // บันทึก Question
        await Section.updateOne(
            { section_id: sectionId },
            { $push: { questions: question.question_id } } // เพิ่ม question_id ใน Section
        );
        return question;
    } catch (error) {
        throw new Error(`เกิดข้อผิดพลาดในการเพิ่ม Question: ${error.message}`);
    }
};


/**
 * แก้ไข Question
 */
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
        throw new Error(`เกิดข้อผิดพลาดในการแก้ไข Question: ${error.message}`);
    }
};

/**
 * ลบ Question
 */
exports.deleteQuestion = async (sectionId, questionId) => {
    await validateExistence(Section, { section_id: sectionId }, 'Section not found');
    await validateExistence(Question, { question_id: questionId }, 'Question not found');
    try {
        await Question.deleteOne({ question_id: questionId });
        await Section.updateOne(
            { section_id: sectionId },
            { $pull: { questions: questionId } }
        );
        return { message: 'Question deleted' };
    } catch (error) {
        throw new Error(`เกิดข้อผิดพลาดในการลบ Question: ${error.message}`);
    }
};

/**
 * เพิ่ม Option
 */
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
        throw new Error(`เกิดข้อผิดพลาดในการเพิ่ม Option: ${error.message}`);
    }
};

/**
 * แก้ไข Option
 */
exports.editOption = async (questionId, optionData) => {
    await validateExistence(Question, { question_id: questionId }, 'Question not found');
    try {
        const updatedQuestion = await Question.findOneAndUpdate(
            { question_id: questionId, 'options.option_id': optionData.option_id },
            { $set: { 'options.$': optionData } },
            { new: true }
        );
        return updatedQuestion;
    } catch (error) {
        throw new Error(`เกิดข้อผิดพลาดในการแก้ไข Option: ${error.message}`);
    }
};

/**
 * ลบ Option
 */
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
        throw new Error(`เกิดข้อผิดพลาดในการลบ Option: ${error.message}`);
    }
};
