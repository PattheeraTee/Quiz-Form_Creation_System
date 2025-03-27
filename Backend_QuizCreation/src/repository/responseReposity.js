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

  // ดึงข้อมูล Response ตาม form_id
  getResponsesForDownload: async (formId) => {
    return await Response.find({ form_id: formId }).lean(); // ✅ ทำงานได้

  },

  // ดึง Response ทั้งหมดที่มีคำตอบของ question_id ที่ระบุ
  getResponsesByQuestionId: async (questionId) => {
    return await Response.find({
      "answers.question_id": questionId
    }).lean();
  },

  updateResponseById: async (id, update) => {
    return await Response.findByIdAndUpdate(id, update, { new: true });
  }  
};


module.exports = responseRepository;
