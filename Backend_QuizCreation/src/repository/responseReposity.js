const Response = require('../models/response');

const responseRepository = {
  // สร้าง Response ใหม่
  createResponse: async (responseData) => {
    const response = new Response(responseData);
    return await response.save();
  },

  // ลบ Response ตาม response_id
  deleteResponses: async (responseIds) => {
    return await Response.deleteMany({ response_id: { $in: responseIds } });
  },

  // ดึง Response ตาม form_id
  getResponsesByFormId: async (formId) => {
    return await Response.find({ form_id: formId }).lean();
  },

  // ตรวจสอบการมีอยู่ของ Response
  validateResponseExistence: async (responseId) => {
    const response = await Response.findOne({ response_id: responseId }).lean();
    if (!response) {
      throw new Error('Response not found');
    }
    return response;
  },

  // ดึง Response ตาม response_id
  getResponsesByFormId: async (formId) => {
    return await Response.find({ form_id: formId }).lean();
  },

  // ตรวจสอบว่าอีเมลนี้เคยตอบแบบฟอร์มนี้หรือไม่
  getResponseByEmail: async (formId, email) => {
    return await Response.findOne({ form_id: formId, email }).lean();
  },

  // ดึง Response ทั้งหมดที่เกี่ยวข้องกับ form_id
  getAllResponsesByFormId: async (formId) => {
    return await Response.find({ form_id: formId }).lean();
  },
};

module.exports = responseRepository;
