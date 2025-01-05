const { filterRestrictedFields } = require('../utils/filterRestrictedFields');
const { themeRestrictedFields } = require('../constants/restrictedFields');
const themeRepository = require('../repository/themeRepository');

// แก้ไข Theme
exports.editTheme = async (themeId, themeData) => {
    try {
        // ตรวจสอบว่า Theme มีอยู่
        await themeRepository.validateThemeExistence(themeId);

        // กรองฟิลด์ต้องห้าม
        const updateFields = filterRestrictedFields(themeData, themeRestrictedFields);

        if (Object.keys(updateFields).length === 0) {
            throw new Error('No valid fields to update');
        }

        // อัปเดต Theme
        const updatedTheme = await themeRepository.updateTheme(themeId, updateFields);

        // ส่งคืน Theme ที่อัปเดตแล้ว
        return updatedTheme;
    } catch (error) {
        throw new Error(`Error editing theme: ${error.message}`);
    }
};