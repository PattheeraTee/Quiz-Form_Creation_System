const { filterRestrictedFields } = require("../utils/filterRestrictedFields");
const { responseRestrictedFields } = require("../constants/restrictedFields");
const responseRepository = require("../repository/responseReposity");
const questionRepository = require("../repository/questionRepository");
const formRepository = require("../repository/formRepository");
const formService = require("./formService");

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
const formatDate = (dateString) => {
  if (!dateString) return null;
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("th-TH", options); // ใช้ 'th-TH' สำหรับภาษาไทย หรือ 'en-US' สำหรับภาษาอังกฤษ
};

exports.getResponsesByForm = async (formId) => {
  try {
    const formDetails = await formService.getFormDetails(formId);
    const questions = formDetails.sections.flatMap(
      (section) => section.questions
    );

    if (!questions || questions.length === 0) {
      throw new Error("No questions found in the form");
    }

    const questionMap = {};
    questions.forEach((q) => {
      questionMap[q.question_id] = q;
    });

    const responses = await responseRepository.getResponsesByFormId(formId);

    if (!responses || responses.length === 0) {
      return {
        message: "No responses found for the specified form",
        total_response: 0,
        questions: [],
      };
    }

    const questionSummaries = {};

    responses.forEach((response) => {
      response.answers.forEach((answer) => {
        const questionId = answer.question_id;

        if (!questionMap[questionId]) {
          throw new Error(
            `Question with ID ${questionId} not found in the related sections of form`
          );
        }

        const question = questionMap[questionId];

        if (!questionSummaries[questionId]) {
          questionSummaries[questionId] = {
            question_id: questionId,
            type: answer.type,
            question_text: question.question,
            total_answer_question: 0,
            total_answer_option: [],
            average_rating: null,
            answer_rating_count: {},
            recent_answers: [],
          };

          if (
            ["multiple_choice", "dropdown", "checkbox"].includes(answer.type)
          ) {
            questionSummaries[questionId].total_answer_option =
              question.options.map((option) => ({
                option_id: option.option_id,
                text: option.text,
                count: 0,
              }));
          }
        }

        const questionSummary = questionSummaries[questionId];

        questionSummary.total_answer_question += 1;

        switch (answer.type) {
          case "multiple_choice":
          case "dropdown":
            const selectedOption = answer.option_id[0];
            const optionToUpdate = questionSummary.total_answer_option.find(
              (opt) => opt.option_id === selectedOption
            );
            if (optionToUpdate) {
              optionToUpdate.count += 1;
            }
            break;

          case "checkbox":
            answer.option_id.forEach((option) => {
              const optionToUpdate = questionSummary.total_answer_option.find(
                (opt) => opt.option_id === option
              );
              if (optionToUpdate) {
                optionToUpdate.count += 1;
              }
            });
            break;

          case "text_input":
            if (answer.answer_text) {
              questionSummary.recent_answers.push(answer.answer_text);
              if (questionSummary.recent_answers.length > 3) {
                questionSummary.recent_answers.shift();
              }
            }
            break;

          case "date":
            if (answer.answer_date) {
              questionSummary.recent_answers.push(
                formatDate(answer.answer_date)
              ); // แปลงรูปแบบวันที่
              if (questionSummary.recent_answers.length > 3) {
                questionSummary.recent_answers.shift();
              }
            }
            break;

          case "rating":
            const rating = answer.answer_rating;
            if (rating !== undefined) {
              questionSummary.answer_rating_count[rating] =
                (questionSummary.answer_rating_count[rating] || 0) + 1;
            }
            break;

          default:
            break;
        }
      });
    });

    Object.values(questionSummaries).forEach((summary) => {
      if (summary.type === "rating") {
        const totalRatings = Object.entries(summary.answer_rating_count).reduce(
          (sum, [rating, count]) => sum + Number(rating) * count,
          0
        );
        const totalResponses = summary.total_answer_question;
        summary.average_rating = totalRatings / totalResponses || 0;
      }
    });

    return {
      message: "Responses retrieved successfully",
      total_response: responses.length,
      questions: Object.values(questionSummaries),
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
