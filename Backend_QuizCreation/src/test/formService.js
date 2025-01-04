// File: service/formService.js
const formRepo = require('../repository/formRepository');

exports.createNewForm = async (requestData) => {
    return await formRepo.createForm(requestData);
};

exports.getFormDetails = async (formId) => {
    return await formRepo.getForm(formId);
};

exports.updateFormData = async (formId, updateData) => {
    return await formRepo.updateForm(formId, updateData);
};

exports.updateCoverpage = async (coverpageId, updateData) => {
    return await formRepo.updateCoverpage(coverpageId, updateData);
};

exports.addSection = async (formId, sectionData) => {
    return await formRepo.addSection(formId, sectionData);
};

exports.editSection = async (sectionId, sectionData) => {
    return await formRepo.editSection(sectionId, sectionData);
};

exports.deleteSection = async (formId, sectionId) => {
    return await formRepo.deleteSection(formId, sectionId);
};

exports.addQuestion = async (sectionId, questionData) => {
    return await formRepo.addQuestion(sectionId, questionData);
};

exports.editQuestion = async (questionId, questionData) => {
    return await formRepo.editQuestion(questionId, questionData);
};

exports.deleteQuestion = async (sectionId, questionId) => {
    return await formRepo.deleteQuestion(sectionId, questionId);
};

exports.addOption = async (questionId, optionData) => {
    return await formRepo.addOption(questionId, optionData);
};

exports.editOption = async (questionId, optionId, optionData) => {
    return await formRepo.editOption(questionId, optionId, optionData);
};

exports.deleteOption = async (questionId, optionId) => {
    return await formRepo.deleteOption(questionId, optionId);
};