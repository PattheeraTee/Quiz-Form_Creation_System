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

exports.updateForm = async (req, res) => {
    try {
        const data = await formService.updateFormData(req.params.formId, req.body);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCoverpage = async (req, res) => {
    try {
        const data = await formService.updateCoverpage(req.params.coverpageId, req.body);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addSection = async (req, res) => {
    try {
        const data = await formService.addSection(req.params.formId, req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.editSection = async (req, res) => {
    try {
        const data = await formService.editSection(req.params.sectionId, req.body);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteSection = async (req, res) => {
    try {
        const data = await formService.deleteSection(req.params.formId, req.params.sectionId);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addQuestion = async (req, res) => {
    try {
        const data = await formService.addQuestion(req.params.sectionId, req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.editQuestion = async (req, res) => {
    try {
        const data = await formService.editQuestion(req.params.questionId, req.body);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const data = await formService.deleteQuestion(req.params.sectionId, req.params.questionId);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addOption = async (req, res) => {
    try {
        const data = await formService.addOption(req.params.questionId, req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.editOption = async (req, res) => {
    try {
        const data = await formService.editOption(req.params.questionId, req.body);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteOption = async (req, res) => {
    try {
        const data = await formService.deleteOption(req.params.questionId, req.params.optionId);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};