const responseService = require("../service/responseService");
const formRepository = require("../repository/formRepository");
const responseStrategy = require("../service/responseStrategy");
const fs = require("fs"); // ✅ เพิ่มบรรทัดนี้


exports.submitResponse = async (req, res) => {
  try {
    const { form_id } = req.body;

    // ดึงประเภทของ Form
    const form = await formRepository.getForm(form_id);

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    // เรียกใช้ Service เพื่อบันทึก Response และคำนวณคะแนน
    const response = await responseService.submitQuizResponse(
      req.body,
      form.form_type
    );

    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// exports.getResponsesByForm = async (req, res) => {
//   const { formId } = req.params;

//   try {
//     const responseSummary = await responseService.getResponsesByForm(formId);
//     res.status(200).json(responseSummary);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

exports.getResponsesByForm = async (req, res) => {
  const { formId } = req.params;
  const { type } = req.query; // รับค่า `type` จาก frontend

  try {
    let formType = type; // เริ่มต้นจากค่าที่ได้จาก frontend

    if (!formType) {
      // ถ้า frontend ไม่ส่ง type มา ให้ดึงจากฐานข้อมูลแทน
      const formDetails = await formService.getFormDetails(formId);
      if (!formDetails) {
        return res.status(404).json({ message: "Form not found" });
      }
      formType = formDetails.form_type;
    }

    // ใช้ Strategy Pattern เพื่อเลือกวิธีดึงข้อมูล
    const responseSummary = await responseStrategy.getResponsesByType(formType, formId);

    res.status(200).json(responseSummary);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteResponses = async (req, res) => {
  try {
    const { responseIds } = req.body; // Expecting an array of response_ids
    const result = await responseService.deleteResponses(responseIds);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getDetailResponses = async (req, res) => {
  const { formId } = req.params;
  const { type } = req.query; // ✅ รับ form_type จาก query

  try {
    let formType = type;
    if (!formType) {
      return res.status(400).json({ error: "Missing formType in request" });
    }

    const responseDetail = await responseStrategy.getDetailResponsesByType(formType, formId);
    res.status(200).json(responseDetail);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.downloadResponses = async (req, res) => {
  try {
    console.log("📢 กำลังเตรียมไฟล์สำหรับดาวน์โหลด...");
    const { formId } = req.params;
    const filePath = await responseService.downloadResponsesAsExcel(formId);

    // ตรวจสอบว่าไฟล์มีอยู่จริงหรือไม่
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "ไฟล์ไม่พบ หรือไม่มีข้อมูล" });
    }

    // ✅ กำหนด Header เพื่อให้เบราว์เซอร์เข้าใจว่าเป็นไฟล์ Excel
    res.setHeader("Content-Disposition", `attachment; filename=responses_${formId}.xlsx`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    // ✅ ส่งไฟล์ให้ผู้ใช้ดาวน์โหลด
    res.download(filePath, (err) => {
      if (err) {
        console.error("❌ Error downloading file:", err);
        return res.status(500).json({ error: "เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์" });
      }

      console.log(`✅ ไฟล์ถูกส่งไปยังผู้ใช้: ${filePath}`);
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.getTextInputAnswersByQuestionId = async (req, res) => {
  const { questionId } = req.params;

  if (!questionId) {
    return res.status(400).json({ message: "Missing question_id" });
  }

  try {
    const result = await responseService.getTextInputAnswersByQuestionId(questionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve answers", error: error.message });
  }
};

