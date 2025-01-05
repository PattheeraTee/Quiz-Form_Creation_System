const Response = require('../models/response');

// ---------- ฟังก์ชันสำหรับการตรวจสอบข้อมูล ----------


// ---------- ฟังก์ชันสำหรับการจัดการข้อมูล ----------
// ********** Form **********
// ลบ Responses
exports.deleteResponses = async (responseIds) => {
    await Response.deleteMany({ response_id: { $in: responseIds } });
};