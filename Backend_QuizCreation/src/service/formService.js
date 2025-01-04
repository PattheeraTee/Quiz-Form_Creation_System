const { v4: uuidv4 } = require('uuid');
const { filterRestrictedFields } = require('../utils/filterRestrictedFields');
const { formRestrictedFields, coverpageRestrictedFields, sectionRestrictedFields, questionRestrictedFields, optionRestrictedFields, themeRestrictedFields } = require('../constants/restrictedFields');
const formRepo = require('../repository/formRepository');

//สร้างฟอร์มใหม่
exports.createNewForm = async (requestData) => {
    try {
        // สร้าง ID ล่วงหน้า
        const formId = uuidv4();
        const coverPageId = uuidv4();
        const themeId = uuidv4();
        const sectionId = uuidv4();

        // สร้าง Coverpage
        const coverPage = await formRepo.createCoverpage({
            cover_page_id: coverPageId,
            form_id: formId
        });

        // สร้าง Theme
        const theme = await formRepo.createTheme({
            theme_id: themeId,
            form_id: formId,
        });

        // สร้าง Section
        const section = await formRepo.createSection({
            section_id: sectionId,
            form_id: formId
        });

        // สร้าง Form และเชื่อมโยงกับ Coverpage, Theme, และ Section
        const form = await formRepo.createForm({
            form_id: formId,
            user_id: requestData.user_id,
            form_type: requestData.form_type,
            cover_page_id: coverPageId,
            theme_id: themeId,
            section_id: [sectionId],
            result_id: [], // ค่าเริ่มต้นสำหรับ result_id
        });

        // ส่งคืนผลลัพธ์
        return { form, coverPage, theme, section };
    } catch (error) {
        throw new Error(`เกิดข้อผิดพลาดในการสร้างฟอร์ม: ${error.message}`);
    }
};

// แก้ไขข้อมูลฟอร์ม
exports.updateFormData = async (formId, updateData) => {
    try {
        // ตรวจสอบว่าฟอร์มมีอยู่
        await formRepo.validateFormExistence(formId);

        // กรองฟิลด์ต้องห้าม
        const updateFields = filterRestrictedFields(updateData, formRestrictedFields);

        if (Object.keys(updateFields).length === 0) {
            throw new Error('No valid fields to update');
        }

        // อัปเดตข้อมูลในฟอร์ม
        const updatedForm = await formRepo.updateForm(formId, updateFields);

        return updatedForm;
    } catch (error) {
        throw new Error(`Error updating form: ${error.message}`);
    }
};

// ดึงข้อมูลฟอร์ม
exports.getFormDetails = async (formId) => {
    try {
        // ตรวจสอบว่าฟอร์มมีอยู่จริง
        await formRepo.validateFormExistence(formId);

        // ดึงข้อมูลฟอร์ม
        const form = await formRepo.getForm(formId);

        // ดึงข้อมูล Coverpage และ Theme
        const coverPage = await formRepo.getCoverpage(formId);
        const theme = await formRepo.getTheme(formId);

        // ดึงข้อมูล Sections และ Questions
        const sections = await formRepo.getSections(formId);

        for (let section of sections) {
            const questions = await formRepo.getQuestionsBySection(section.section_id);
            section.questions = questions.map((question) => ({
                ...question,
                options: question.options, // แสดง options ในแต่ละคำถาม
            }));
        }

        // รวมข้อมูลทั้งหมดและส่งกลับ
        return { form, coverPage, theme, sections };
    } catch (error) {
        throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูลแบบฟอร์ม: ${error.message}`);
    }
};

// ลบฟอร์ม
exports.deleteForm = async (formId) => {
    try {
        // ตรวจสอบว่า Form มีอยู่
        const form = await formRepo.validateFormExistence(formId);

        // ลบ Coverpage
        await formRepo.deleteCoverpage(form.cover_page_id);

        // ลบ Sections ที่เกี่ยวข้อง
        if (form.section_id && form.section_id.length > 0) {
            await formRepo.deleteSections(form.section_id);
        }

        // ลบ Results ที่เกี่ยวข้อง
        if (form.result_id && form.result_id.length > 0) {
            await formRepo.deleteResults(form.result_id);
        }

        // ลบ Theme
        await formRepo.deleteTheme(form.theme_id);

        // ลบ Responses ที่เกี่ยวข้อง
        if (form.response && form.response.length > 0) {
            await formRepo.deleteResponses(form.response);
        }

        // ลบ Form
        await formRepo.deleteForm(formId);

        return { message: 'Form and related data deleted successfully' };
    } catch (error) {
        throw new Error(`Error deleting form: ${error.message}`);
    }
};

// อัปเดต Coverpage
exports.updateCoverpage = async (coverpageId, updateData) => {
    try {
        // ตรวจสอบว่า Coverpage มีอยู่
        await formRepo.validateCoverpageExistence(coverpageId);

        // กรองฟิลด์ต้องห้าม
        const updateFields = filterRestrictedFields(updateData, coverpageRestrictedFields);

        if (Object.keys(updateFields).length === 0) {
            throw new Error('No valid fields to update');
        }

        // อัปเดตข้อมูลใน Coverpage
        const updatedCoverpage = await formRepo.updateCoverpage(coverpageId, updateFields);

        // Return the updated coverpage
        return updatedCoverpage;
    } catch (error) {
        throw new Error(`Error updating coverpage: ${error.message}`);
    }
};

// เพิ่ม Section ใหม่
exports.addSection = async (formId, sectionData) => {
    try {
        // ตรวจสอบการมีอยู่ของ Form
        await formRepo.validateFormExistence(formId);

        // ค้นหา Section ที่มีหมายเลขสูงสุด
        const maxSection = await formRepo.getMaxSectionNumber(formId);
        const nextNumber = maxSection ? maxSection.number + 1 : 1;

        // สร้าง Section ใหม่
        const section = await formRepo.createSection({
            form_id: formId,
            // title: sectionData.title || `Section ${nextNumber}`,
            number: nextNumber,
        });

        // เพิ่ม Section ID ลงในฟอร์ม
        await formRepo.addSectionToForm(formId, section.section_id);

        // ส่งคืน Section ที่สร้างขึ้น
        return section;
    } catch (error) {
        throw new Error(`Error adding section: ${error.message}`);
    }
};

// อัปเดต Section
exports.editSection = async (formId, sectionId, sectionData) => {
    try {
        // ตรวจสอบว่าฟอร์มมีอยู่จริง
        await formRepo.validateFormExistence(formId);

        // ตรวจสอบว่า Section มีอยู่
        await formRepo.validateSectionExistence(sectionId);

        // ตรวจสอบว่า Section เป็นของ Form ที่กำหนด
        await formRepo.validateSectionBelongsToForm(formId, sectionId);

        // กรองฟิลด์ต้องห้าม
        const updateFields = filterRestrictedFields(sectionData, sectionRestrictedFields);

        if (Object.keys(updateFields).length === 0) {
            throw new Error('No valid fields to update');
        }

        // อัปเดตข้อมูลใน Section
        const updatedSection = await formRepo.updateSection(sectionId, updateFields);

        // ส่งคืน Section ที่อัปเดตแล้ว
        return updatedSection;
    } catch (error) {
        throw new Error(`Error editing section: ${error.message}`);
    }
};

// ลบ Section
exports.deleteSection = async (formId, sectionId) => {
    try {
        // ตรวจสอบว่าฟอร์มและ Section มีอยู่จริง
        await formRepo.validateFormExistence(formId);
        await formRepo.validateSectionExistence(sectionId);

        // ตรวจสอบว่า Section เป็นของ Form ที่กำหนด
        await formRepo.validateSectionBelongsToForm(formId, sectionId);

        // ลบ Section
        await formRepo.deleteSection(sectionId);

        // ลบ Section ID ออกจากฟอร์ม
        await formRepo.removeSectionFromForm(formId, sectionId);

        // ดึง Sections ที่เหลือ
        const sections = await formRepo.getSectionsByForm(formId);

        // อัปเดตหมายเลขของ Sections ที่เหลือ
        for (let i = 0; i < sections.length; i++) {
            sections[i].number = i + 1; // กำหนดหมายเลขใหม่
            await formRepo.updateSectionNumber(sections[i]);
        }

        return { message: 'Section deleted and numbers updated' };
    } catch (error) {
        throw new Error(`Error deleting section: ${error.message}`);
    }
};

// เพิ่มคำถาม
exports.addQuestion = async (sectionId, questionData) => {
    try {
        // ตรวจสอบว่า Section มีอยู่
        await formRepo.validateSectionExistence(sectionId);

        // สร้าง Question
        const question = await formRepo.createQuestion({
            section_id: sectionId,
            ...questionData,
        });

        // เพิ่ม Question ID ลงใน Section
        await formRepo.addQuestionToSection(sectionId, question.question_id);

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
        await formRepo.validateSectionExistence(sectionId);

        // ตรวจสอบว่า Question มีอยู่
        await formRepo.validateQuestionExistence(questionId);

        // ตรวจสอบว่า Question อยู่ใน Section ที่กำหนด
        await formRepo.validateQuestionInSection(sectionId, questionId);

        // กรองฟิลด์ต้องห้าม
        const updateFields = filterRestrictedFields(questionData, questionRestrictedFields);

        if (Object.keys(updateFields).length === 0) {
            throw new Error('No valid fields to update');
        }

        // อัปเดต Question
        const updatedQuestion = await formRepo.updateQuestion(questionId, updateFields);

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
        await formRepo.validateSectionExistence(sectionId);
        await formRepo.validateQuestionExistence(questionId);

        // ตรวจสอบว่า Question อยู่ใน Section ที่กำหนด
        await formRepo.validateQuestionInSection(sectionId, questionId);

        // ลบ Question
        await formRepo.deleteQuestion(questionId);

        // ลบ Question ID ออกจาก Section
        await formRepo.removeQuestionFromSection(sectionId, questionId);

        // ส่งข้อความยืนยันการลบ
        return { message: 'Question deleted' };
    } catch (error) {
        throw new Error(`Error deleting question: ${error.message}`);
    }
};

// เพิ่มตัวเลือก
exports.addOption = async (questionId, optionData) => {
    try {
        // ตรวจสอบว่า Question มีอยู่
        await formRepo.validateQuestionExistence(questionId);

        // เพิ่ม Option ใน Question
        const updatedQuestion = await formRepo.addOptionToQuestion(questionId, optionData);

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
        await formRepo.validateQuestionExistence(questionId);

        // ตรวจสอบว่า Option มีอยู่ใน Question
        await formRepo.validateOptionExistence(questionId, optionId);

        // กรองฟิลด์ต้องห้าม
        const updateFields = filterRestrictedFields(optionData, optionRestrictedFields);

        if (Object.keys(updateFields).length === 0) {
            throw new Error('No valid fields to update');
        }

        // อัปเดต Option
        const updatedQuestion = await formRepo.updateOption(questionId, optionId, updateFields);

        return updatedQuestion;
    } catch (error) {
        throw new Error(`Error editing option: ${error.message}`);
    }
};


// ลบ option
exports.deleteOption = async (questionId, optionId) => {
    try {
        // ตรวจสอบว่า Question มีอยู่
        await formRepo.validateQuestionExistence(questionId);

        // ตรวจสอบว่า Option มีอยู่ใน Question
        await formRepo.validateOptionExistence(questionId, optionId);

        // ลบ Option ใน Question
        const updatedQuestion = await formRepo.deleteOption(questionId, optionId);

        // ส่งคืน Question ที่อัปเดตแล้ว
        return updatedQuestion;
    } catch (error) {
        throw new Error(`Error deleting option: ${error.message}`);
    }
};

// แก้ไข Theme
exports.editTheme = async (themeId, themeData) => {
    try {
        // ตรวจสอบว่า Theme มีอยู่
        await formRepo.validateThemeExistence(themeId);

        // กรองฟิลด์ต้องห้าม
        const updateFields = filterRestrictedFields(themeData, themeRestrictedFields);

        if (Object.keys(updateFields).length === 0) {
            throw new Error('No valid fields to update');
        }

        // อัปเดต Theme
        const updatedTheme = await formRepo.updateTheme(themeId, updateFields);

        // ส่งคืน Theme ที่อัปเดตแล้ว
        return updatedTheme;
    } catch (error) {
        throw new Error(`Error editing theme: ${error.message}`);
    }
};

// ดึงข้อมูลฟอร์มทั้งหมดของ User
exports.getFormsByUser = async (userId) => {
    try {
        // ดึง Forms ทั้งหมดของ User
        const forms = await formRepo.getFormsByUserId(userId);
        if (!forms || forms.length === 0) {
            throw new Error('No forms found for the specified user');
        }

        // ดึง form_ids เพื่อนำไปดึงข้อมูล Coverpage และ Theme
        const formIds = forms.map((form) => form.form_id);

        // ดึง Coverpages ที่เกี่ยวข้อง
        const coverpages = await formRepo.getCoverpagesByFormIds(formIds);

        // ดึง Themes ที่เกี่ยวข้อง
        const themes = await formRepo.getThemesByFormIds(formIds);

        // รวมข้อมูล Forms, Coverpages, และ Themes
        const result = forms.map((form) => {
            const coverpage = coverpages.find((cp) => cp.form_id === form.form_id) || {};
            const theme = themes.find((th) => th.form_id === form.form_id) || {};

            return {
                form_id: form.form_id,
                form_type: form.form_type,
                user_id: form.user_id,
                coverpage: {
                    cover_page_id: coverpage.cover_page_id || null,
                    title: coverpage.title || null,
                    cover_page_image: coverpage.cover_page_image || null,
                },
                theme: {
                    theme_id: theme.theme_id || null,
                    primary_color: theme.primary_color || null,
                },
            };
        });

        return result;
    } catch (error) {
        throw new Error(`Error fetching forms: ${error.message}`);
    }
};