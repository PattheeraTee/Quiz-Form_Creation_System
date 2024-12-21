// File: repo/formRepo.js
const Form = require('../models/form');
const Coverpage = require('../models/coverpage');
const Theme = require('../models/theme');
const Section = require('../models/section'); // ตรวจสอบให้แน่ใจว่าไฟล์ section.js มีการส่งออกโมเดล Section อย่างถูกต้อง

exports.createForm = async (data) => {
    try {
        // สร้างแบบฟอร์มใหม่แต่ยังไม่บันทึก
        const form = new Form({
            user_id: data.user_id,
            form_type: data.form_type,
            section_id: [], // เพิ่มค่าเริ่มต้นให้เป็น array ว่าง
            result_id: [] // เพิ่มค่าเริ่มต้นให้เป็น array ว่าง
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
    try {
        const form = await Form.findOne({ form_id: formId });
        if (!form) throw new Error('ไม่พบแบบฟอร์ม');

        const coverPage = await Coverpage.findOne({ form_id: formId });
        const theme = await Theme.findOne({ form_id: formId });
        const section = await Section.findOne({ form_id: formId }).sort({ number: -1 });

        return { form, coverPage, theme, section };
    } catch (error) {
        throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูลแบบฟอร์ม: ${error.message}`);
    }
};