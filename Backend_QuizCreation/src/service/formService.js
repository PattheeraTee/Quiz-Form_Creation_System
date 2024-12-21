// File: service/formService.js
const formRepo = require('../repository/formRepository');

exports.createNewForm = async (requestData) => {
    return await formRepo.createForm(requestData);
};

exports.getFormDetails = async (formId) => {
    return await formRepo.getForm(formId);
};
