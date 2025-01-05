const { filterRestrictedFields } = require("../utils/filterRestrictedFields");
const { responseRestrictedFields } = require("../constants/restrictedFields");
const responseRepository = require("../repository/responseReposity");
const questionRepository = require('../repository/questionRepository');
const formRepository = require("../repository/formRepository");

// บันทึก Response
exports.submitQuizResponse = async (responseData, formType) => {
  try {
    let score = 0;

    if (formType === "quiz") {
      // ดึงคำถามทั้งหมดที่เกี่ยวข้อง
      const questions = await Promise.all(
        responseData.answers.map((answer) =>
          questionRepository.getQuestionById(answer.question_id)
        )
      );

      // คำนวณคะแนน
      for (const answer of responseData.answers) {
        const question = questions.find(
          (q) => q.question_id === answer.question_id
        );

        if (!question) continue;

        const points = question.points || 0;

        switch (question.type) {
          case "text_input":
            if (question.correct_answer.includes(answer.answer_text)) {
              score += points;
            }
            break;

          case "multiple_choice":
          case "dropdown":
            if (
              answer.option_id.length === 1 &&
              question.options.some(
                (option) =>
                  option.option_id === answer.option_id[0] &&
                  option.is_correct === true
              )
            ) {
              score += points;
            }
            break;

          case "checkbox":
            const correctOptions = question.options
              .filter((option) => option.is_correct)
              .map((option) => option.option_id);

            if (
              correctOptions.length === answer.option_id.length &&
              correctOptions.every((id) => answer.option_id.includes(id))
            ) {
              score += points;
            }
            break;

          default:
            break;
        }
      }
    }

    // บันทึก Response
    const savedResponse = await responseRepository.createResponse({
      ...responseData,
      score,
      submitted_at: new Date(),
    });

    return {
      message: "Response submitted successfully",
      response: savedResponse,
    };
  } catch (error) {
    throw new Error(`Error submitting response: ${error.message}`);
  }
};

// ดึง Responses ตาม form_id
exports.getResponsesByForm = async (formId) => {
  try {
    // ตรวจสอบการมีอยู่ของ Form
    await formRepository.validateFormExistence(formId);

    // ดึง Responses ที่เกี่ยวข้อง
    const responses = await responseRepository.getResponsesByFormId(formId);

    return {
      message: "Responses retrieved successfully",
      responses,
    };
  } catch (error) {
    throw new Error(`Error fetching responses: ${error.message}`);
  }
};

// ลบ Responses ตาม response_id
exports.deleteResponses = async (responseIds) => {
  try {
    await responseRepository.deleteResponses(responseIds);
    return { message: "Responses deleted successfully" };
  } catch (error) {
    throw new Error(`Error deleting responses: ${error.message}`);
  }
};
