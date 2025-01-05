const { filterRestrictedFields } = require('../utils/filterRestrictedFields');
const { responseRestrictedFields } = require('../constants/restrictedFields');
const responseRepository = require('../repository/responseReposity');
const formRepository = require('../repository/formRepository');

// บันทึก Response
exports.submitResponse = async (responseData) => {
  try {
    // ตรวจสอบว่า Form ที่เกี่ยวข้องมีอยู่
    await formRepository.validateFormExistence(responseData.form_id);

    // บันทึก Response
    const savedResponse = await responseRepository.createResponse({
      ...responseData,
      submitted_at: new Date(),
    });

    return {
      message: 'Response submitted successfully',
      response: savedResponse,
    };
  } catch (error) {
    throw new Error(`Error submitting response: ${error.message}`);
  }
};

// ดึง Responses ตาม form_id
exports.getResponsesByForm = async (formId) => {
  try {
    // ตรวจสอบการมีอยู่ของ Form
    await formRepository.validateFormExistence(formId);

    // ดึง Responses ที่เกี่ยวข้อง
    const responses = await responseRepository.getResponsesByFormId(formId);

    return {
      message: 'Responses retrieved successfully',
      responses,
    };
  } catch (error) {
    throw new Error(`Error fetching responses: ${error.message}`);
  }
};

// ลบ Responses ตาม response_id
exports.deleteResponses = async (responseIds) => {
  try {
    await responseRepository.deleteResponses(responseIds);
    return { message: 'Responses deleted successfully' };
  } catch (error) {
    throw new Error(`Error deleting responses: ${error.message}`);
  }
};
