const Form = require('../models/form');

// ---------- ฟังก์ชันสำหรับการตรวจสอบข้อมูล ----------
// ตรวจสอบว่ามีแบบฟอร์มอยู่ในฐานข้อมูล
exports.validateFormExistence = async (formId) => {
    const form = await Form.findOne({ form_id: formId });
    if (!form) {
        throw new Error('Form not found');
    }
    return form;
};

// ---------- ฟังก์ชันสำหรับการจัดการข้อมูล ----------
// ********** Form **********
// สร้างฟอร์ม
exports.createForm = async (formData) => {
    const form = new Form(formData);
    await form.save();
    return form;
};

// อัปเดตข้อมูลในฟอร์ม
exports.updateForm = async (formId, updateFields) => {
    return await Form.findOneAndUpdate({ form_id: formId }, updateFields, { new: true });
};

// ลบ Form
exports.deleteForm = async (formId) => {
    await Form.deleteOne({ form_id: formId });
};

// อัปเดตข้อมูลในแบบฟอร์ม
exports.updateForm = async (formId, updateFields) => {
    const updatedForm = await Form.findOneAndUpdate(
        { form_id: formId },
        { $set: updateFields },
        { new: true }
    );
    if (!updatedForm) {
        throw new Error('Failed to update form');
    }
    return updatedForm;
};

// ดึงข้อมูลฟอร์ม จาก form_id
exports.getForm = async (formId) => {
    return await Form.findOne({ form_id: formId });
};

// ดึงข้อมูลฟอร์ม จาก form_id
exports.getFormById = async (formId) => {
    const form = await Form.findOne({ form_id: formId }).lean();
    if (!form) {
      throw new Error('Form not found');
    }
    return form;
};

// ดึงข้อมูลฟอร์มทั้งหมด
exports.getFormsByIds =  async (formIds) => {
        return await Form.find({ form_id: { $in: formIds } }).lean();
};

// ********** Section **********
// เพิ่ม Section ID ลงในฟอร์ม
exports.addSectionToForm = async (formId, sectionId) => {
    await Form.updateOne(
        { form_id: formId },
        { $push: { section_id: sectionId } }
    );
};

// ลบ Section ID ออกจาก Form
exports.removeSectionFromForm = async (formId, sectionId) => {
    await Form.updateOne(
        { form_id: formId },
        { $pull: { section_id: sectionId } }
    );
};

// ---------- ฟังก์ชันสำหรับการดึงข้อมูลของ user ----------
// ดึง Forms ทั้งหมดของ User จาก user_id
exports.getFormsByUserId = async (userId) => {
    return await Form.find({ user_id: userId }).lean();
};


