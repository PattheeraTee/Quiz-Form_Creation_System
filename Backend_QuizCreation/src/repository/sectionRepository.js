const Section = require('../models/section');

// ---------- ฟังก์ชันสำหรับการตรวจสอบข้อมูล ----------
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

// ---------- ฟังก์ชันสำหรับการจัดการข้อมูล ----------
// ********** Form **********
// ลบ Sections
exports.deleteSections = async (sectionIds) => {
    await Section.deleteMany({ section_id: { $in: sectionIds } });
};

// สร้าง Section ใหม่ใน Form
exports.createSection = async (sectionData) => {
    const section = new Section(sectionData);
    await section.save();
    return section;
};

// ดึงข้อมูล Sections จาก form_id
exports.getSections = async (formId) => {
    return await Section.find({ form_id: formId }).sort({ number: 1 }).lean();
};

// ********** Section **********
// ค้นหา Section ที่มีหมายเลขสูงสุดในฟอร์ม
exports.getMaxSectionNumber = async (formId) => {
    return await Section.findOne({ form_id: formId }).sort({ number: -1 });
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

// ดึง Sections ทั้งหมดใน Form จาก form_id
exports.getSectionsByForm = async (formId) => {
    return await Section.find({ form_id: formId }).sort({ number: 1 });
};

// อัปเดตหมายเลข Section
exports.updateSectionNumber = async (section) => {
    await section.save();
};

// ********** Question **********
// เพิ่ม Question ID ลงใน Section
exports.addQuestionToSection = async (sectionId, questionId) => {
    await Section.updateOne(
        { section_id: sectionId },
        { $push: { questions: questionId } }
    );
};

// ลบ Question ID จาก Section
exports.removeQuestionFromSection = async (sectionId, questionId) => {
    await Section.updateOne(
        { section_id: sectionId },
        { $pull: { questions: questionId } }
    );
};