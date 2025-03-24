const responseService = require("./responseService");

const responseStrategies = {
    quiz: responseService.getResponsesByQuizForm,
    survey: responseService.getResponsesBySurveyForm,
};

exports.getResponsesByType = async (formType, formId) => {
    const strategy = responseStrategies[formType];

    if (!strategy) {
    throw new Error(`No response strategy found for form type: ${formType}`);
    }

    return await strategy(formId);
};
