const { filterRestrictedFields } = require('../utils/filterRestrictedFields');
const { coverpageRestrictedFields } = require('../constants/restrictedFields');
const coverpageRepository = require('../repository/coverpageRepository');

// อัปเดต Coverpage
exports.updateCoverpage = async (coverpageId, updateData) => {
    try {
        // ตรวจสอบว่า Coverpage มีอยู่
        await coverpageRepository.validateCoverpageExistence(coverpageId);

        // กรองฟิลด์ต้องห้าม
        const updateFields = filterRestrictedFields(updateData, coverpageRestrictedFields);

        if (Object.keys(updateFields).length === 0) {
            throw new Error('No valid fields to update');
        }

        // อัปเดตข้อมูลใน Coverpage
        const updatedCoverpage = await coverpageRepository.updateCoverpage(coverpageId, updateFields);

        // Return the updated coverpage
        return updatedCoverpage;
    } catch (error) {
        throw new Error(`Error updating coverpage: ${error.message}`);
    }
};
