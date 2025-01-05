const Coverpage = require('../models/coverpage');

// ---------- ฟังก์ชันสำหรับการตรวจสอบข้อมูล ----------
// ตรวจสอบว่า Coverpage มีอยู่ในฐานข้อมูลหรือไม่
exports.validateCoverpageExistence = async (coverpageId) => {
    const coverpage = await Coverpage.findOne({ cover_page_id: coverpageId });
    if (!coverpage) {
        throw new Error('Coverpage not found');
    }
    return coverpage;
};

// ---------- ฟังก์ชันสำหรับการจัดการข้อมูล ----------
// ********** form **********
// สร้าง Coverpage ใหม่ใน Form
exports.createCoverpage = async (coverpageData) => {
    const coverpage = new Coverpage(coverpageData);
    await coverpage.save();
    return coverpage;
};

// ลบ Coverpage
exports.deleteCoverpage = async (coverPageId) => {
    await Coverpage.deleteOne({ cover_page_id: coverPageId });
};

// ดึงข้อมูล Coverpage จาก form_id
exports.getCoverpage = async (formId) => {
    return await Coverpage.findOne({ form_id: formId });
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

// ---------- ฟังก์ชันสำหรับการดึงข้อมูลของ user ----------
// ดึง Coverpage ที่เกี่ยวข้องกับ Form
exports.getCoverpagesByFormIds = async (formIds) => {
    return await Coverpage.find({ form_id: { $in: formIds } }).lean();
};

