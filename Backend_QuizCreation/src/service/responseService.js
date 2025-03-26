const { filterRestrictedFields } = require("../utils/filterRestrictedFields");
const { responseRestrictedFields } = require("../constants/restrictedFields");
const responseRepository = require("../repository/responseReposity");
const questionRepository = require("../repository/questionRepository");
const formRepository = require("../repository/formRepository");
const formService = require("./formService");

const validateRequiredQuestions = (questions, answers) => {
  // ค้นหา questions ที่ required แต่ไม่มีคำตอบใน answers
  const missingRequiredQuestions = questions.filter(
    (question) =>
      question.required && !answers.some((answer) => answer.question_id === question.question_id)
  );

  if (missingRequiredQuestions.length > 0) {
    throw new Error(
      `Missing required answers for questions: ${missingRequiredQuestions
        .map((q) => q.question)
        .join(", ")}`
    );
  }
};

// บันทึก Response
exports.submitQuizResponse = async (responseData, formType) => {
  try {
    let score = 0;

    // ดึงคำถามทั้งหมดที่เกี่ยวข้อง
    const questions = await Promise.all(
      responseData.answers.map((answer) =>
        questionRepository.getQuestionById(answer.question_id)
      )
    );

    // ถ้าเป็นแบบทดสอบ (quiz) คำนวณคะแนน
    if (formType === "quiz") {
      for (const answer of responseData.answers) {
        const question = questions.find(
          (q) => q.question_id === answer.question_id
        );
        if (!question) {
          answer.question_score = 0;
          continue;
        }

        const points = question.points || 0;
        let earned = 0;

        switch (question.type) {
          case "text_input":
            if (typeof answer.answer_text === "string") {
              const userAnswer = answer.answer_text.trim().toLowerCase();

              if (typeof question.correct_answer === "string") {
                if (userAnswer === question.correct_answer.trim().toLowerCase()) {
                  earned = points;
                }
              } else if (Array.isArray(question.correct_answer)) {
                const normalizedAnswers = question.correct_answer.map(ans =>
                  typeof ans === "string" ? ans.trim().toLowerCase() : ""
                );
                if (normalizedAnswers.includes(userAnswer)) {
                  earned = points;
                }
              }
            }
            break;

          case "multiple_choice":
          case "dropdown":
            if (
              Array.isArray(answer.option_id) &&
              answer.option_id.length === 1
            ) {
              const selected = answer.option_id[0];
              const correctOption = question.options.find(
                (opt) => opt.option_id === selected && opt.is_correct
              );
              if (correctOption) earned = points;
            }
            break;

          case "checkbox":
            const correctOptions = question.options
              .filter((opt) => opt.is_correct)
              .map((opt) => opt.option_id)
              .sort();

            const selectedOptions = (answer.option_id || []).sort();

            if (
              JSON.stringify(correctOptions) === JSON.stringify(selectedOptions)
            ) {
              earned = points;
            }
            break;

          default:
            break;
        }

        answer.question_score = earned; // ✅ เก็บคะแนนของข้อนี้
        score += earned; // ✅ บวกคะแนนรวม
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

// แปลงวันที่เป็น YYYY-MM-DD
const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // เดือนเริ่มจาก 0 ต้องบวก 1
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // รูปแบบ YYYY-MM-DD
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

// ดึงข้อมูลการตอบกลับ by form_id สำหรับ survey
exports.getResponsesBySurveyForm = async (formId) => {
  try {
    const formDetails = await formService.getFormDetails(formId);
    const { coverPage } = formDetails; // ดึงข้อมูล title ของ coverPage
    const sections = formDetails.sections || []; // ตรวจสอบว่ามี sections หรือไม่
    const questions = sections.flatMap((section) => section.questions || []); // ตรวจสอบว่ามีคำถามใน section หรือไม่

    if (!questions || questions.length === 0) {
      // หากไม่มีคำถามในฟอร์ม
      return {
        message: "Responses retrieved successfully",
        title: coverPage.title, // เพิ่ม title ของ coverPage
        total_response: 0, // ไม่มีการตอบกลับ
        questions: [], // รายละเอียดคำถามว่างเปล่า
      };
    }

    const questionMap = {};
    questions.forEach((q) => {
      questionMap[q.question_id] = q;
    });

    const responses = await responseRepository.getResponsesByFormId(formId);

    if (!responses || responses.length === 0) {
      // หากไม่มีการตอบกลับ (responses ว่าง)
      return {
        message: "Responses retrieved successfully",
        title: coverPage.title, // เพิ่ม title ของ coverPage
        total_response: 0, // ไม่มีการตอบกลับ
        questions: [], // รายละเอียดคำถามว่างเปล่า
      };
    }

    const questionSummaries = {};

    responses.forEach((response) => {
      response.answers.forEach((answer) => {
        const questionId = answer.question_id;

        if (!questionMap[questionId]) {
          // ข้ามคำตอบที่ไม่มีคำถามในคำถามที่กำหนด
          return;
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
              ); // แปลงวันที่เป็น YYYY-MM-DD
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
      title: coverPage.title, // เพิ่ม title ของ coverPage
      total_response: responses.length,
      questions: Object.values(questionSummaries),
    };
  } catch (error) {
    throw new Error(`Error fetching responses: ${error.message}`);
  }
};

// ดึงข้อมูลการตอบกลับ by form_id สำหรับ quiz
exports.getResponsesByQuizForm = async (formId) => {
  try {
    const formDetails = await formService.getFormDetails(formId);
    const { coverPage } = formDetails; 
    const sections = formDetails.sections || [];
    const questions = sections.flatMap((section) => section.questions || []);

    if (!questions.length) {
      return {
        message: "Responses retrieved successfully",
        title: coverPage.title,
        total_response: 0,
        questions: [],
      };
    }

    const questionMap = {};
    questions.forEach((q) => {
      questionMap[q.question_id] = q;
    });

    const responses = await responseRepository.getResponsesByFormId(formId);

    if (!responses.length) {
      return {
        message: "Responses retrieved successfully",
        title: coverPage.title,
        total_response: 0,
        questions: [],
      };
    }

    const questionSummaries = {};

    responses.forEach((response) => {
      response.answers.forEach((answer) => {
        const questionId = answer.question_id;
        if (!questionMap[questionId]) return;

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
            correct_attempts: 0, // ✅ เพิ่มตัวนับคำตอบที่ถูกต้อง
          };

          if (["multiple_choice", "dropdown", "checkbox"].includes(answer.type)) {
            questionSummaries[questionId].total_answer_option =
              question.options.map((option) => ({
                option_id: option.option_id,
                text: option.text,
                count: 0,
                is_correct: option.is_correct, // ✅ เพิ่มข้อมูล is_correct ไว้
              }));
          }
        }

        const questionSummary = questionSummaries[questionId];
        questionSummary.total_answer_question += 1;

        switch (answer.type) {
          case "multiple_choice":
          case "dropdown": {
            const selectedOption = answer.option_id[0];
            const optionToUpdate = questionSummary.total_answer_option.find(opt => opt.option_id === selectedOption);
            if (optionToUpdate) {
              optionToUpdate.count += 1;
              if (optionToUpdate.is_correct) {
                questionSummary.correct_attempts += 1;
              }
            }
            break;
          }

          case "checkbox": {
            const correctOptions = question.options.filter(opt => opt.is_correct).map(opt => opt.option_id);
            const userOptions = answer.option_id;

            userOptions.forEach(option => {
              const optionToUpdate = questionSummary.total_answer_option.find(opt => opt.option_id === option);
              if (optionToUpdate) {
                optionToUpdate.count += 1;
              }
            });

            if (correctOptions.length === userOptions.length && correctOptions.every(opt => userOptions.includes(opt))) {
              questionSummary.correct_attempts += 1;
            }
            break;
          }

          case "text_input":
            if (question.correct_answer.some(ans => ans.toLowerCase() === answer.answer_text.toLowerCase())) {
              questionSummary.correct_attempts += 1;
            }
            questionSummary.recent_answers.push(answer.answer_text);
            if (questionSummary.recent_answers.length > 3) {
              questionSummary.recent_answers.shift();
            }
            break;

          case "date":
            questionSummary.recent_answers.push(formatDate(answer.answer_date));
            if (questionSummary.recent_answers.length > 3) {
              questionSummary.recent_answers.shift();
            }
            break;

          case "rating":
            const rating = answer.answer_rating;
            if (rating !== undefined) {
              questionSummary.answer_rating_count[rating] = (questionSummary.answer_rating_count[rating] || 0) + 1;
            }
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
        summary.average_rating = totalResponses > 0 ? (totalRatings / totalResponses) : 0;
      }

      // ✅ คำนวณ % ตอบถูก
      summary.correct_percentage = summary.total_answer_question > 0
        ? ((summary.correct_attempts / summary.total_answer_question) * 100).toFixed(2) + "%"
        : "0%";
    });

    return {
      message: "Responses retrieved successfully",
      title: coverPage.title,
      total_response: responses.length,
      questions: Object.values(questionSummaries),
    };
  } catch (error) {
    throw new Error(`Error fetching responses: ${error.message}`);
  }
};

// ดึงข้อมูลตารางผลการตอบกลับ สำหรับ survey
exports.getDetailResponsesBySurveyForm = async (formId) => {
  try {
    const formDetails = await formService.getFormDetails(formId);
    const sections = formDetails.sections || [];
    const questions = sections.flatMap((section) => section.questions || []);

    if (!questions.length) {
      return { message: "No responses available", total_response: 0, responses: [] };
    }

    const questionMap = {};
    questions.forEach((q) => {
      questionMap[q.question_id] = q;
    });

    const responses = await responseRepository.getResponsesByFormId(formId);
    if (!responses.length) {
      return { message: "No responses available", total_response: 0, responses: [] };
    }

    const userResponses = responses.map((response) => ({
      email: response.email || "anonymous",
      responses: response.answers.map((answer) => {
        const question = questionMap[answer.question_id];
        const selectedOptionTexts = (answer.option_id || []).map((optId) =>
          question?.options?.find((opt) => opt.option_id === optId)?.text || optId
        );

        return {
          question_id: answer.question_id,
          response_text: answer.answer_text || null,
          selected_options: selectedOptionTexts,
        };
      }),
    }));

    return {
      message: "Survey responses retrieved successfully",
      total_response: responses.length,
      userResponses,
    };
  } catch (error) {
    throw new Error(`Error fetching survey responses: ${error.message}`);
  }
};

// ดึงข้อมูลตารางผลการตอบกลับ สำหรับ quiz
exports.getDetailResponsesByQuizForm = async (formId) => {
  try {
    const formDetails = await formService.getFormDetails(formId);
    const sections = formDetails.sections || [];
    const questions = sections.flatMap((section) => section.questions || []);

    if (!questions.length) {
      return {
        message: "No responses available",
        total_response: 0,
        userResponses: [],
      };
    }

    const questionMap = {};
    questions.forEach((q) => (questionMap[q.question_id] = q));

    const responses = await responseRepository.getResponsesByFormId(formId);
    if (!responses.length) {
      return {
        message: "No responses available",
        total_response: 0,
        userResponses: [],
      };
    }

    const userResponses = responses.map((response) => ({
      email: response.email || "anonymous",
      responses: response.answers.map((answer) => {
        const question = questionMap[answer.question_id];
        const optionsMap =
          question?.options?.reduce((acc, option) => {
            acc[option.option_id] = option.text;
            return acc;
          }, {}) || {};

        return {
          question_id: answer.question_id,
          question_score: answer.question_score || 0,
          response_text: answer.answer_text || null,
          selected_options: (answer.option_id || []).map(
            (optId) => optionsMap[optId] || optId
          ),
        };
      }),
    }));

    return {
      message: "Quiz responses retrieved successfully",
      total_response: responses.length,
      userResponses,
    };
  } catch (error) {
    throw new Error(`Error fetching quiz responses: ${error.message}`);
  }
};


