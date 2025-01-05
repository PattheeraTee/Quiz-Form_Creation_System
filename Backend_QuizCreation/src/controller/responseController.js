const responseService = require('../service/responseService');

exports.submitResponse = async (req, res) => {
  try {
    const response = await responseService.submitResponse(req.body);
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getResponsesByForm = async (req, res) => {
  const { formId } = req.params;

  try {
    const responses = await responseService.getResponsesByForm(formId);
    res.status(200).json(responses);
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
