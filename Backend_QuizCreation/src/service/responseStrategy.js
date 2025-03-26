const responseService = require("./responseService");

// ใช้ Strategy Pattern เพื่อเลือกวิธีดึงข้อมูลในหน้าการตอบกลับ
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

// ใช้ Strategy Pattern เพื่อเลือกวิธีดึงข้อมูลในตารางหน้าการตอบกลับ
const detailResponseStrategies = {
    quiz: responseService.getDetailResponsesByQuizForm,
    survey: responseService.getDetailResponsesBySurveyForm,
};

exports.getDetailResponsesByType = async (formType, formId) => {
    const strategy = detailResponseStrategies[formType];

    if (!strategy) {
        throw new Error(`No detail response strategy found for form type: ${formType}`);
    }

    return await strategy(formId);
};