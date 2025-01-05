const Result = require('../models/result');

// ---------- ฟังก์ชันสำหรับการตรวจสอบข้อมูล ----------


// ---------- ฟังก์ชันสำหรับการจัดการข้อมูล ----------
// ********** Form **********
// ลบ Results
exports.deleteResults = async (resultIds) => {
    await Result.deleteMany({ result_id: { $in: resultIds } });
};