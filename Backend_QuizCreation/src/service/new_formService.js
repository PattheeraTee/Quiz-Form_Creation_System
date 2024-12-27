// File: service/formService.js
const formRepo = require('../repository/new_formRepository');

// สร้างแบบฟอร์มใหม่
// สร้างฟอร์มใหม่
exports.createNewForm = async (data) => {
    try {
        // สร้างแบบฟอร์มใหม่
        const form = await formRepo.createForm({
            user_id: data.user_id,
            form_type: data.form_type,
            section_id: [],
        });

        // สร้างหน้าปกและธีม
        const coverPage = await formRepo.createCoverpage({
            form_id: form.form_id,
            title: 'Untitled Form',
        });

        const theme = await formRepo.createTheme({
            form_id: form.form_id,
        });

        // สร้าง Section เริ่มต้น
        const maxSection = await formRepo.getSections(form.form_id).then((sections) =>
            sections.length > 0 ? Math.max(...sections.map((s) => s.number)) : 0
        );
        const nextNumber = maxSection + 1;

        const section = await formRepo.createSection({
            form_id: form.form_id,
            title: 'Section 1',
            number: nextNumber,
        });

        // อัปเดตฟอร์มด้วยการเชื่อมโยงหน้าปก ธีม และ Section
        form.cover_page_id = coverPage.cover_page_id;
        form.theme_id = theme.theme_id;
        form.section_id.push(section.section_id);
        await form.save();

        return { form, coverPage, theme, section };
    } catch (error) {
        throw new Error(`Error creating form: ${error.message}`);
    }
};
// ดึงข้อมูลแบบฟอร์มพร้อมความสัมพันธ์
exports.getFormDetails = async (formId) => {
    try {
        const form = await formRepo.getForm(formId);
        if (!form) throw new Error('Form not found');

        const coverPage = await formRepo.getCoverpage(formId);
        const theme = await formRepo.getTheme(formId);

        const sections = await formRepo.getSections(formId);
        for (let section of sections) {
            const questions = await formRepo.getQuestions(section.section_id);
            section.questions = questions.map((question) => ({
                ...question,
                options: question.options,
            }));
        }

        return { form, coverPage, theme, sections };
    } catch (error) {
        throw new Error(`Error fetching form details: ${error.message}`);
    }
};

// อัปเดตข้อมูล Form
exports.updateFormData = async (formId, updateData) => {
    try {
        return await formRepo.updateForm(formId, updateData);
    } catch (error) {
        throw new Error(`Error updating form data: ${error.message}`);
    }
};

// อัปเดต Coverpage
exports.updateCoverpage = async (coverpageId, updateData) => {
    try {
        return await formRepo.updateCoverpage(coverpageId, updateData);
    } catch (error) {
        throw new Error(`Error updating coverpage: ${error.message}`);
    }
};

// เพิ่ม Section
exports.addSection = async (formId, sectionData) => {
    try {
        const sections = await formRepo.getSectionsByFormId(formId);
        const nextNumber = sections.length > 0 ? sections[sections.length - 1].number + 1 : 1;

        const newSection = await formRepo.addSection({
            ...sectionData,
            form_id: formId,
            number: nextNumber,
            title: sectionData.title || `Section ${nextNumber}`,
        });

        await formRepo.updateFormSections(formId, 'add', newSection.section_id);
        return newSection;
    } catch (error) {
        throw new Error(`Error adding section: ${error.message}`);
    }
};

// แก้ไข Section
exports.editSection = async (sectionId, sectionData) => {
    try {
        return await formRepo.editSection(sectionId, sectionData);
    } catch (error) {
        throw new Error(`Error editing section: ${error.message}`);
    }
};

// ลบ Section
exports.deleteSection = async (formId, sectionId) => {
    try {
        await formRepo.deleteSection(sectionId);
        await formRepo.updateFormSections(formId, 'remove', sectionId);

        const sections = await formRepo.getSectionsByFormId(formId);
        for (let i = 0; i < sections.length; i++) {
            sections[i].number = i + 1;
            await sections[i].save();
        }

        return { message: 'Section deleted and numbers updated' };
    } catch (error) {
        throw new Error(`Error deleting section: ${error.message}`);
    }
};

// เพิ่ม Question
exports.addQuestion = async (sectionId, questionData) => {
    try {
        const newQuestion = await formRepo.addQuestion({
            ...questionData,
            section_id: sectionId,
        });

        await formRepo.updateFormSections(sectionId, 'add', newQuestion.question_id);
        return newQuestion;
    } catch (error) {
        throw new Error(`Error adding question: ${error.message}`);
    }
};

// แก้ไข Question
exports.editQuestion = async (questionId, questionData) => {
    try {
        return await formRepo.editQuestion(questionId, questionData);
    } catch (error) {
        throw new Error(`Error editing question: ${error.message}`);
    }
};

// ลบ Question
exports.deleteQuestion = async (sectionId, questionId) => {
    try {
        await formRepo.deleteQuestion(questionId);
        return { message: 'Question deleted' };
    } catch (error) {
        throw new Error(`Error deleting question: ${error.message}`);
    }
};

// เพิ่ม Option
exports.addOption = async (questionId, optionData) => {
    try {
        return await formRepo.addOption(questionId, optionData);
    } catch (error) {
        throw new Error(`Error adding option: ${error.message}`);
    }
};

// แก้ไข Option
exports.editOption = async (questionId, optionId, optionData) => {
    try {
        return await formRepo.editOption(questionId, optionId, optionData);
    } catch (error) {
        throw new Error(`Error editing option: ${error.message}`);
    }
};

// ลบ Option
exports.deleteOption = async (questionId, optionId) => {
    try {
        return await formRepo.deleteOption(questionId, optionId);
    } catch (error) {
        throw new Error(`Error deleting option: ${error.message}`);
    }
};
