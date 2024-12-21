// File: controller/formController.js
const formService = require('../service/formService');

exports.createForm = async (req, res) => {
    try {
        const data = await formService.createNewForm(req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getForm = async (req, res) => {
    try {
        const data = await formService.getFormDetails(req.params.formId);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};