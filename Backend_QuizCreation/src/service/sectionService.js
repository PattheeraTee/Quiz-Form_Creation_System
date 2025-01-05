const { filterRestrictedFields } = require('../utils/filterRestrictedFields');
const { sectionRestrictedFields } = require('../constants/restrictedFields');
const formRepository = require('../repository/formRepository');
const sectionRepository = require('../repository/sectionRepository');
const questionRepository = require('../repository/questionRepository');

// เพิ่ม Section ใหม่
exports.addSection = async (formId, sectionData) => {
    try {
        // ตรวจสอบการมีอยู่ของ Form
        await formRepository.validateFormExistence(formId);

        // ค้นหา Section ที่มีหมายเลขสูงสุด
        const maxSection = await sectionRepository.getMaxSectionNumber(formId);
        const nextNumber = maxSection ? maxSection.number + 1 : 1;

        // สร้าง Section ใหม่
        const section = await sectionRepository.createSection({
            form_id: formId,
            // title: sectionData.title || `Section ${nextNumber}`,
            number: nextNumber,
        });

        // เพิ่ม Section ID ลงในฟอร์ม
        await formRepository.addSectionToForm(formId, section.section_id);

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
        await formRepository.validateFormExistence(formId);

        // ตรวจสอบว่า Section มีอยู่
        await sectionRepository.validateSectionExistence(sectionId);

        // ตรวจสอบว่า Section เป็นของ Form ที่กำหนด
        await sectionRepository.validateSectionBelongsToForm(formId, sectionId);

        // กรองฟิลด์ต้องห้าม
        const updateFields = filterRestrictedFields(sectionData, sectionRestrictedFields);

        if (Object.keys(updateFields).length === 0) {
            throw new Error('No valid fields to update');
        }

        // อัปเดตข้อมูลใน Section
        const updatedSection = await sectionRepository.updateSection(sectionId, updateFields);

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
        await formRepository.validateFormExistence(formId);
        await sectionRepository.validateSectionExistence(sectionId);

        // ตรวจสอบว่า Section เป็นของ Form ที่กำหนด
        await sectionRepository.validateSectionBelongsToForm(formId, sectionId);

        // ลบคำถามทั้งหมดที่เกี่ยวข้องกับ Section
        await questionRepository.deleteQuestionsBySection(sectionId);

        // ลบ Section
        await sectionRepository.deleteSection(sectionId);

        // ลบ Section ID ออกจากฟอร์ม
        await formRepository.removeSectionFromForm(formId, sectionId);

        // ดึง Sections ที่เหลือ
        const sections = await sectionRepository.getSectionsByForm(formId);

        // อัปเดตหมายเลขของ Sections ที่เหลือ
        for (let i = 0; i < sections.length; i++) {
            sections[i].number = i + 1; // กำหนดหมายเลขใหม่
            await sectionRepository.updateSectionNumber(sections[i]);
        }

        return { message: 'Section deleted and numbers updated' };
    } catch (error) {
        throw new Error(`Error deleting section: ${error.message}`);
    }
};