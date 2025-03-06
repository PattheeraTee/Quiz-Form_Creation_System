const responseService = require("../service/responseService");
const formRepository = require("../repository/formRepository");

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

exports.getResponsesByForm = async (req, res) => {
  const { formId } = req.params;

  try {
    const responseSummary = await responseService.getResponsesByForm(formId);
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

exports.checkUserResponse = async (req, res) => {
  const { formId } = req.params;
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const result = await responseService.checkUserResponse(formId, email);
    
    res.status(result.alreadyResponded ? 200 : 404).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllResponsesByForm = async (req, res) => {
  const { formId } = req.params;

  try {
    const allResponses = await responseService.getAllResponsesByFormId(formId);

    if (allResponses.total_responses === 0) {
      return res.status(404).json({
        status: "not_found",
        form_id: formId,
        total_responses: 0,
        responses: []
      });
    }

    // ถ้าพบ Response ไม่ต้องมี message
    res.status(200).json({
      form_id: formId,
      total_responses: allResponses.total_responses,
      responses: allResponses.responses
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
