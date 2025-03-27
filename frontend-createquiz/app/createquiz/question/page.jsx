"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useContext } from 'react';
import CoverPage from "./coverpage/page";
import SectionQuiz from "./section-quiz/page";
import SectionSurvey from "./section-survey/page";
import SectionPsychology from "./section-psychology/page";
import axios from "axios";
import { QuizContext } from "../QuizContext"; // Import QuizProvider
import BackgroundVertical from "../../components/images/backgroud-cloud-vertical.svg";

export default function Question({ quizData }) {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const questionTypes = [
    { label: "คำถามเลือกตอบ", icon: "⭕", value: "multiple_choice" },
    { label: "ช่องกาเครื่องหมาย", icon: "✔️", value: "checkbox" },
    { label: "ดรอปดาวน์", icon: "⬇️", value: "dropdown" },
    { label: "การให้คะแนน", icon: "⭐", value: "rating" },
    { label: "เติมคำตอบ", icon: "✍️", value: "text_input" },
    { label: "วันที่", icon: "📅", value: "date" },
  ];
  const [sections, setSections] = useState(quizData?.sections || []);
  const { primaryColor} = useContext(QuizContext);
  
  useEffect(() => {
    if (quizData?.sections) {
      const updatedSections = quizData.sections.map((section) => ({
        ...section,
        questions: section.questions.map((question) => ({
          ...question,
          required: question.required || false,
          correct_answer: Array.isArray(question.correct_answer) ? question.correct_answer : [],
          maxSelect: question.maxSelect || 1,
          ratingLevel: question.type === "rating" ? question.limit || 1 : null,
        })),
      }));
      setSections(updatedSections);
    }
  }, [quizData]); // ✅ ต้องมี dependency ที่ถูกต้อง
  
  console.log("quizData:", quizData);

  const addSection = async () => {
    const newSection = {
      id: sections.length + 1,
      title: "",
      description: "",
      questions: [],
      showQuestionTypes: false,
    };

    try {
      const formId = quizData?.form?.form_id; // ดึง formId จาก quizData
      if (!formId) {
        console.error("Form ID not found!");
        return;
      }
      console.log("Form ID:", formId);

      const response = await axios.post(
        `http://localhost:3001/form/${formId}/sections`,
        {
          title: newSection.title,
          description: newSection.description,
          questions: newSection.questions,
        }
      );

      if (response.status === 201) {
        console.log("Section added successfully:", response.data);

        // เพิ่ม Section ใหม่ใน State
        setSections((prevSections) => [
          ...prevSections,
          { ...newSection, ...response.data }, // ใช้ข้อมูลจาก response เพื่ออัปเดต
        ]);
      }
    } catch (error) {
      console.error("Failed to add section:", error);
    }
  };

  const addQuestion = async (sectionId, type) => {
    const newQuestion = {
      type,
      question: "คำถาม",
      options: [], // กำหนดค่าเริ่มต้นให้ options เป็น array ว่าง
      correctAnswers: type === "text_input" ? [""] : [], // คำตอบที่ถูกต้องเฉพาะประเภท text_input
      maxSelect: type === "checkbox" ? 1 : null, // ค่า maxSelect เฉพาะประเภท checkbox
      isRequired: false,
      ratingLevel: type === "rating" ? 10 : null, // ค่าเริ่มต้นสำหรับ rating
    };

    // เตรียม Payload โดยไม่รวม `options`
    const payload = {
      type: newQuestion.type,
      question: newQuestion.question,
    };

    try {
      console.log("sectionId:", sectionId);
      console.log("type question:", newQuestion.type);
      console.log("Payload for POST request:", payload);

      // ส่งคำขอไปยัง API
      const response = await axios.post(
        `http://localhost:3001/form/${sectionId}/questions`,
        payload
      );

      if (response.status === 201) {
        console.log("Question added successfully:", response.data);

        // อัปเดต State ด้วยคำถามใหม่
        const updatedSections = sections.map((section) => {
          if (section.section_id === sectionId) {
            return {
              ...section,
              questions: [
                ...section.questions,
                { ...newQuestion, ...response.data },
              ],
            };
          }
          return section;
        });
        setSections(updatedSections);
      }
    } catch (error) {
      console.error("Failed to add question:", error);
    }
  };

  const updateOption = (sectionId, questionId, optionId, value = null, weight = null) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.section_id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.question_id === questionId
                  ? {
                      ...question,
                      options: question.options.map((option) =>
                        option.option_id === optionId
                          ? { 
                              ...option, 
                              ...(value !== null && { text: value }), // อัปเดตข้อความตัวเลือก
                              ...(weight !== null && { weight }) // อัปเดต weight ถ้ามีค่า
                            }
                          : option
                      ),
                    }
                  : question
              ),
            }
          : section
      )
    );
  
    // ส่งค่าไปยัง API เพื่ออัปเดตในฐานข้อมูล
    autosaveOption(questionId, optionId, { ...(value !== null && { text: value }), ...(weight !== null && { weight }) });
  };
  
  const autosaveOption = async (questionId, optionId, updates) => {
    try {
      await axios.patch(`http://localhost:3001/form/${questionId}/options/${optionId}`, updates);
      console.log("✅ Option updated successfully:", updates);
    } catch (error) {
      console.error("❌ Option autosave failed:", error);
    }
  };
  

  const updateRatingLevel = async (sectionId, questionId, value) => {
    const updatedSections = sections.map((section) => {
      if (section.section_id === sectionId) {
        return {
          ...section,
          questions: section.questions.map((question) => {
            if (question.question_id === questionId && question.type === "rating") {
              return { ...question, ratingLevel: value };
            }
            return question;
          }),
        };
      }
      return section;
    });
  
    setSections(updatedSections);
  
    // Save to server
    try {
      const response = await axios.patch(
        `http://localhost:3001/form/${sectionId}/questions/${questionId}`,
        { limit: value }
      );
      console.log("RatingLevel updated successfully:", response.data);
    } catch (error) {
      console.error("Failed to update RatingLevel:", error);
    }
  };

  const addOption = async (sectionId, questionId) => {
    try {
      // ตรวจสอบ form_type ว่าเป็น quiz หรือไม่
      const isQuiz = quizData?.form?.form_type === "quiz";
  
      // กำหนด payload สำหรับ API
      const payload = {
        text: "ตัวเลือกใหม่",
        ...(isQuiz && { is_correct: false }), // เพิ่ม is_correct: false ถ้า form_type เป็น quiz
      };
  
      // เรียก API เพื่อเพิ่ม Option
      const response = await axios.post(
        `http://localhost:3001/form/${questionId}/options`,
        payload
      );
  
      if (response.status === 201) {
        const updatedQuestion = response.data;
  
        // อัปเดต State ด้วยข้อมูลใหม่
        setSections((prevSections) =>
          prevSections.map((section) =>
            section.section_id === sectionId
              ? {
                  ...section,
                  questions: section.questions.map((question) =>
                    question.question_id === questionId
                      ? {
                          ...question,
                          options: updatedQuestion.options,
                        }
                      : question
                  ),
                }
              : section
          )
        );
  
        console.log("Option added and State updated successfully!");
      }
    } catch (error) {
      console.error("Error adding option:", error);
    }
  };
  

  const removeOption = async (sectionId, questionId, optionId) => {
    try {
      // ส่งคำขอ DELETE ไปยัง API
      const response = await axios.delete(
        `http://localhost:3001/form/${questionId}/options/${optionId}`
      );

      if (response.status === 200) {
        console.log("Option deleted successfully:", response.data);

        // อัปเดต state หลังจากลบสำเร็จ
        setSections((prevSections) =>
          prevSections.map((section) =>
            section.section_id === sectionId
              ? {
                  ...section,
                  questions: section.questions.map((question) =>
                    question.question_id === questionId
                      ? {
                          ...question,
                          options: question.options.filter(
                            (option) => option.option_id !== optionId
                          ),
                        }
                      : question
                  ),
                }
              : section
          )
        );
      } else {
        console.error("Failed to delete option:", response.data);
      }
    } catch (error) {
      console.error("Error deleting option:", error);
    }
  };

  const updateMaxSelect = async (sectionId, questionId, value) => {
    const updatedSections = sections.map((section) => {
      if (section.section_id === sectionId) {
        return {
          ...section,
          questions: section.questions.map((question) => {
            if (question.question_id === questionId && question.type === "checkbox") {
              return { ...question, maxSelect: value };
            }
            return question;
          }),
        };
      }
      return section;
    });
  
    setSections(updatedSections);
  
    // Save to server
    try {
      const response = await axios.patch(
        `http://localhost:3001/form/${sectionId}/questions/${questionId}`,
        { limit: value }
      );
      console.log("MaxSelect updated successfully:", response.data);
    } catch (error) {
      console.error("Failed to update MaxSelect:", error);
    }
  };
  

const toggleCorrectOption = async (sectionId, questionId, optionId) => {
  try {
    const sectionIndex = sections.findIndex(
      (section) => section.section_id === sectionId
    );
    const questionIndex = sections[sectionIndex].questions.findIndex(
      (q) => q.question_id === questionId
    );

    // อัปเดตค่าของตัวเลือกใน State
    const updatedSections = [...sections];
    const optionIndex = updatedSections[sectionIndex].questions[
      questionIndex
    ].options.findIndex((opt) => opt.option_id === optionId);

    // Toggle is_correct
    updatedSections[sectionIndex].questions[questionIndex].options[
      optionIndex
    ].is_correct =
      !updatedSections[sectionIndex].questions[questionIndex].options[
        optionIndex
      ].is_correct;

    setSections(updatedSections);

    // ส่งคำขอ PATCH ไปยัง backend
    const updatedOption =
      updatedSections[sectionIndex].questions[questionIndex].options[
        optionIndex
      ];

    await axios.patch(
      `http://localhost:3001/form/${questionId}/options/${optionId}`,
      { is_correct: updatedOption.is_correct }
    );

    console.log(`Option ${optionId} updated successfully`);
  } catch (error) {
    console.error("Failed to toggle correct option:", error);
  }
};


  const setCorrectOption = async (sectionId, questionId, optionIdx) => {
    try {
      // ค้นหาคำถามที่เกี่ยวข้อง
      const question = sections
        .find((section) => section.section_id === sectionId)
        ?.questions.find((q) => q.question_id === questionId);
  
      if (!question || !question.options) {
        console.error("Question or options not found");
        return;
      }
  
      // อัปเดต is_correct ในทุก option
      const updatedOptions = question.options.map((option, idx) => ({
        ...option,
        is_correct: idx === optionIdx, // ทำให้ true สำหรับตัวเลือกที่เลือก
      }));
  
      // ส่ง API PATCH เพื่ออัปเดตทุก option
      await Promise.all(
        updatedOptions.map((option) =>
          axios.patch(
            `http://localhost:3001/form/${questionId}/options/${option.option_id}`,
            { is_correct: option.is_correct }
          )
        )
      );
  
      // อัปเดต State
      const updatedSections = sections.map((section) => {
        if (section.section_id === sectionId) {
          return {
            ...section,
            questions: section.questions.map((q) =>
              q.question_id === questionId
                ? { ...q, options: updatedOptions }
                : q
            ),
          };
        }
        return section;
      });
  
      setSections(updatedSections);
      console.log("Correct option set successfully");
    } catch (error) {
      console.error("Failed to set correct option:", error);
    }
  };
  
  
  

  const addCorrectAnswer = async (sectionId, questionId) => {
    try {
      const updatedSections = sections.map((section) => {
        if (section.section_id === sectionId) {
          return {
            ...section,
            questions: section.questions.map((question) => {
              if (question.question_id === questionId) {
                return {
                  ...question,
                  correct_answer: [...(question.correct_answer || []), ""],
                };
              }
              return question;
            }),
          };
        }
        return section;
      });
  
      setSections(updatedSections); // อัปเดต State ก่อน
      await axios.patch(`http://localhost:3001/form/${sectionId}/questions/${questionId}`, {
        correct_answer: updatedSections
          .find((section) => section.section_id === sectionId)
          ?.questions.find((question) => question.question_id === questionId)?.correct_answer,
      });
    } catch (error) {
      console.error("Failed to add correct answer:", error);
    }
  };
  
  const removeCorrectAnswer = async (sectionId, questionId, idx) => {
    try {
      const updatedSections = sections.map((section) => {
        if (section.section_id === sectionId) {
          return {
            ...section,
            questions: section.questions.map((question) => {
              if (question.question_id === questionId) {
                return {
                  ...question,
                  correct_answer: question.correct_answer.filter((_, index) => index !== idx),
                };
              }
              return question;
            }),
          };
        }
        return section;
      });
  
      setSections(updatedSections); // อัปเดต State ก่อน
      await axios.patch(`http://localhost:3001/form/${sectionId}/questions/${questionId}`, {
        correct_answer: updatedSections
          .find((section) => section.section_id === sectionId)
          ?.questions.find((question) => question.question_id === questionId)?.correct_answer,
      });
    } catch (error) {
      console.error("Failed to remove correct answer:", error);
    }
  };
  
  const updateCorrectAnswer = async (sectionId, questionId, idx, value) => {
    try {
      const updatedSections = sections.map((section) => {
        if (section.section_id === sectionId) {
          return {
            ...section,
            questions: section.questions.map((question) => {
              if (question.question_id === questionId) {
                const updatedAnswers = [...question.correct_answer];
                updatedAnswers[idx] = value;
                return { ...question, correct_answer: updatedAnswers };
              }
              return question;
            }),
          };
        }
        return section;
      });
  
      setSections(updatedSections); // อัปเดต State ก่อน
      await axios.patch(`http://localhost:3001/form/${sectionId}/questions/${questionId}`, {
        correct_answer: updatedSections
          .find((section) => section.section_id === sectionId)
          ?.questions.find((question) => question.question_id === questionId)?.correct_answer,
      });
    } catch (error) {
      console.error("Failed to update correct answer:", error);
    }
  };
  
  const updatePoints = async (sectionId, questionId, value) => {
    // Update the local state
    console.log("sectionId:", sectionId);
    console.log("questionId:", questionId);
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.section_id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.question_id === questionId
                  ? { ...question, points: parseInt(value) || 0 }
                  : question
              ),
            }
          : section
      )
    );
  
    // Save to the server
    try {
      const response = await axios.patch(
        `http://localhost:3001/form/${sectionId}/questions/${questionId}`,
        { points: parseInt(value) || 0 } // Send points as part of the payload
      );
      console.log("Points updated successfully:", response.data);
    } catch (error) {
      console.error("Failed to update points:", error);
    }
  };
  

  const toggleRequired = async (sectionId, questionId) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.section_id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.question_id === questionId
                  ? { ...question, required: !question.required }
                  : question
              ),
            }
          : section
      )
    );
  
    try {
      const updatedQuestion = sections
        .find((section) => section.section_id === sectionId)
        ?.questions.find((question) => question.question_id === questionId);
  
      if (!updatedQuestion) {
        console.error("Question not found");
        return;
      }
  
      console.log("Updating required to:", !updatedQuestion.required);
  
      await axios.patch(
        `http://localhost:3001/form/${sectionId}/questions/${questionId}`,
        { required: !updatedQuestion.required} // ส่งค่าไปยัง API
      );
  
      console.log("Required status updated successfully");
    } catch (error) {
      console.error("Failed to update required status:", error);
    }
  };
  
  

  const deleteQuestion = async (sectionId, questionId) => {
    try {
      // สร้าง URL ที่รวม sectionId และ questionId
      const url = `http://localhost:3001/form/${sectionId}/questions/${questionId}`;
      console.log("Deleting question:", url);

      // ส่งคำขอ DELETE
      const response = await axios.delete(url);

      if (response.status === 200) {
        console.log("Question deleted successfully:", response.data);

        // อัปเดต state เพื่อลบคำถามออกจาก UI
        setSections((prevSections) =>
          prevSections.map((section) =>
            section.section_id === sectionId
              ? {
                  ...section,
                  questions: section.questions.filter(
                    (question) => question.question_id !== questionId
                  ),
                }
              : section
          )
        );
      } else {
        console.error("Failed to delete question:", response.data);
      }
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const deleteSection = async (sectionId) => {
    const formId = quizData?.form?.form_id; // ดึง formId จาก quizData
    if (!formId) {
      console.error("Form ID not found!");
      return;
    }

    try {
      // ส่งคำขอลบ section ไปยัง API
      const response = await axios.delete(
        `http://localhost:3001/form/${formId}/sections/${sectionId}`
      );

      if (response.status === 200) {
        console.log("Section deleted successfully:", response.data);

        // อัปเดต state เพื่อเอา section ที่ลบออก
        setSections((prevSections) =>
          prevSections.filter((section) => section.section_id !== sectionId)
        );
      } else {
        console.error("Failed to delete section:", response.data);
      }
    } catch (error) {
      console.error("Error deleting section:", error);
    }
  };

  // const toggleAddQuestionVisibility = (sectionId) => {
  //   setShowAddQuestion((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  // };

  const toggleQuestionTypesVisibility = (sectionId) => {
    const updatedSections = sections.map((section) =>
      section.section_id === sectionId
        ? { ...section, showQuestionTypes: !section.showQuestionTypes }
        : section
    );
    setSections(updatedSections);
  };
  const handleUploadImage = (e, sectionId, questionId, optionIdx = null) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSections((prevSections) =>
          prevSections.map((section) =>
            section.section_id === sectionId
              ? {
                  ...section,
                  questions: section.questions.map((question) =>
                    question.question_id === questionId
                      ? {
                          ...question,
                          ...(optionIdx !== null
                            ? {
                                // อัปเดต image ใน options
                                options: question.options.map((option, idx) =>
                                  idx === optionIdx
                                    ? { ...option, image: reader.result }
                                    : option
                                ),
                              }
                            : {
                                // อัปเดต image ของคำถาม
                                image: reader.result,
                              }),
                        }
                      : question
                  ),
                }
              : section
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };
  

  const updateSectionTitle = (sectionId, newTitle) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.section_id === sectionId
          ? { ...section, title: newTitle }
          : section
      )
    );
  };

  const updateSectionDescription = (sectionId, newDescription) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.section_id === sectionId
          ? { ...section, description: newDescription }
          : section
      )
    );
  };

  const handleAutosaveForQuestion = async (sectionId, questionId, updates) => {
    try {
      const response = await axios.patch(
        `http://localhost:3001/form/${sectionId}/questions/${questionId}`,
        updates
      );
    } catch (error) {
      console.error("Autosave question failed:", error);
    }
  };

  const updateQuestion = (sectionId, questionId, field, value) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.section_id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.question_id === questionId
                  ? { ...question, [field]: value }
                  : question
              ),
            }
          : section
      )
    );
  
    // Autosave the updated question
    autosaveQuestion(sectionId, questionId, { [field]: value });
  };
  
  const autosaveQuestion = async (sectionId, questionId, updates) => {
    try {
      const response = await axios.patch(
        `http://localhost:3001/form/${sectionId}/questions/${questionId}`,
        updates
      );
      console.log("Question autosave successful:", response.data);
    } catch (error) {
      console.error("Question autosave failed:", error);
    }
  };

  const handleWeightChange = async (sectionId, questionId, optionId, newWeight) => {
    try {
      console.log(`🔹 Updating weight for option ${optionId} to ${newWeight}`);
      updateOption(sectionId, questionId, optionId, null, newWeight); // อัปเดต UI และส่ง API PATCH
    } catch (error) {
      console.error("❌ Error updating weight:", error);
    }
  };
  
  
  
  const renderSectionComponent = () => {
    if (!Array.isArray(sections) || sections.length === 0) {
      // console.error("No valid sections available");
      return (
        <div className="text-center mt-5">No valid sections available</div>
      );
    }
    return sections.map((section) => {
      switch (type) {
        case "quiz":
          return (
            <SectionQuiz
              key={section.section_id}
              section={section}
              questionTypes={questionTypes}
              addQuestion={addQuestion}
              updateOption={updateOption}
              updateRatingLevel={updateRatingLevel}
              addOption={addOption}
              removeOption={removeOption}
              updateMaxSelect={updateMaxSelect}
              toggleRequired={toggleRequired}
              deleteQuestion={deleteQuestion}
              deleteSection={deleteSection}
              toggleQuestionTypesVisibility={toggleQuestionTypesVisibility}
              addSection={addSection}
              toggleCorrectOption={toggleCorrectOption}
              setCorrectOption={setCorrectOption}
              addCorrectAnswer={addCorrectAnswer}
              removeCorrectAnswer={removeCorrectAnswer}
              updateCorrectAnswer={updateCorrectAnswer}
              updatePoints={updatePoints}
              handleUploadImage={handleUploadImage}
              updateSectionTitle={updateSectionTitle}
              updateSectionDescription={updateSectionDescription}
              updateQuestion={updateQuestion}
              formId={quizData?.form?.form_id}
            />
          );
        case "survey":
          return (
            <SectionSurvey
              key={section.section_id}
              section={section}
              questionTypes={questionTypes}
              addQuestion={addQuestion}
              updateOption={updateOption}
              updateRatingLevel={updateRatingLevel}
              addOption={addOption}
              removeOption={removeOption}
              updateMaxSelect={updateMaxSelect}
              toggleRequired={toggleRequired}
              deleteQuestion={deleteQuestion}
              deleteSection={deleteSection}
              toggleQuestionTypesVisibility={toggleQuestionTypesVisibility}
              addSection={addSection}
              handleUploadImage={handleUploadImage}
              updateSectionTitle={updateSectionTitle}
              updateSectionDescription={updateSectionDescription}
              updateQuestion={updateQuestion}
              handleAutosaveForQuestion={handleAutosaveForQuestion}
              formId={quizData?.form?.form_id} 
            />
          );
        case "psychology":
          return (
            <SectionPsychology
            key={section.section_id}
            section={section}
            questionTypes={questionTypes}
            addQuestion={addQuestion}
            updateOption={updateOption}
            updateRatingLevel={updateRatingLevel}
            addOption={addOption}
            removeOption={removeOption}
            updateMaxSelect={updateMaxSelect}
            toggleRequired={toggleRequired}
            deleteQuestion={deleteQuestion}
            deleteSection={deleteSection}
            toggleQuestionTypesVisibility={toggleQuestionTypesVisibility}
            addSection={addSection}
            handleUploadImage={handleUploadImage}
            updateSectionTitle={updateSectionTitle}
            updateSectionDescription={updateSectionDescription}
            updateQuestion={updateQuestion}
            handleAutosaveForQuestion={handleAutosaveForQuestion}
            formId={quizData?.form?.form_id} 
              handleWeightChange={handleWeightChange}
            />
          );
        default:
          return (
            <SectionQuiz
              key={section.id}
              section={section}
              questionTypes={questionTypes}
              addQuestion={addQuestion}
              updateOption={updateOption}
              updateRatingLevel={updateRatingLevel}
              addOption={addOption}
              removeOption={removeOption}
              updateMaxSelect={updateMaxSelect}
              toggleRequired={toggleRequired}
              deleteQuestion={deleteQuestion}
              deleteSection={deleteSection}
              toggleQuestionTypesVisibility={toggleQuestionTypesVisibility}
              addSection={addSection}
              toggleCorrectOption={toggleCorrectOption}
              setCorrectOption={setCorrectOption}
              addCorrectAnswer={addCorrectAnswer}
              removeCorrectAnswer={removeCorrectAnswer}
              updateCorrectAnswer={updateCorrectAnswer}
              updatePoints={updatePoints}
              handleUploadImage={handleUploadImage}
            />
          );
      }
    });
  };

  return (
<div className="relative min-h-screen py-8">
  {/* Layer for gradient */}
  <div
    className="absolute inset-0"
    style={{
      background: `linear-gradient(to bottom, ${primaryColor}10, ${primaryColor})`, // สีอ่อนลงอีก 40%
      zIndex: 0,
    }}
  ></div>

  {/* Layer for background image */}
  <div
    className="absolute inset-0"
    style={{
      backgroundImage: `url('${BackgroundVertical.src}')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      zIndex: 1,
    }}
  ></div>

  {/* Content */}
  <div className="relative z-10">
    <CoverPage coverPageData={quizData?.coverPage} theme={quizData?.theme} />
    {renderSectionComponent()}
  </div>
</div>


  );
}
