const responseService = require("../service/responseService");
const formRepository = require("../repository/formRepository");
const responseStrategy = require("../service/responseStrategy");

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
