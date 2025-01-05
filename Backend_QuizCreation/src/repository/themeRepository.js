const Theme = require('../models/theme');

// ---------- ฟังก์ชันสำหรับการตรวจสอบข้อมูล ----------
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
// ลบ Theme
exports.deleteTheme = async (themeId) => {
    await Theme.deleteOne({ theme_id: themeId });
};

// สร้าง Theme ใหม่ ใน Form
exports.createTheme = async (themeData) => {
    const theme = new Theme(themeData);
    await theme.save();
    return theme;
};

// ดึงข้อมูล Theme
exports.getTheme = async (formId) => {
    return await Theme.findOne({ form_id: formId });
};

// *********** Theme ***********
// แก้ไข Theme
exports.updateTheme = async (themeId, updateFields) => {
    const updatedTheme = await Theme.findOneAndUpdate(
        { theme_id: themeId },
        { $set: updateFields }, // อัปเดตเฉพาะฟิลด์ที่ผ่านการกรอง
        { new: true } // ส่งข้อมูลที่อัปเดตแล้วกลับมา
    );

    if (!updatedTheme) {
        throw new Error('Failed to update theme');
    }

    return updatedTheme;
};

// ---------- ฟังก์ชันสำหรับการดึงข้อมูลของ user ----------
// ดึง Themes ที่เกี่ยวข้องกับ Form
exports.getThemesByFormIds = async (formIds) => {
    return await Theme.find({ form_id: { $in: formIds } }).lean();
};