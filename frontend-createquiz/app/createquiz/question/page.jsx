"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import CoverPage from "./coverpage/page";
import SectionQuiz from "./section-quiz/page";
import SectionSurvey from "./section-survey/page";
import SectionPsychology from "./section-psychology/page";
import axios from "axios";

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

  useEffect(() => {
    if (quizData?.sections) {
      // ตรวจสอบว่า `sections` เป็นอาร์เรย์
      if (Array.isArray(quizData.sections)) {
        setSections(quizData.sections);
      } else {
        console.warn(
          "Expected sections to be an array, wrapping it into an array:",
          quizData.sections
        );
        setSections([quizData.sections]); // แปลงเป็นอาร์เรย์ถ้าไม่ใช่
      }
    } else {
      console.warn("No sections found in quizData");
    }
  }, [quizData]);

  useEffect(() => {
    if (quizData?.sections) {
      const updatedSections = quizData.sections.map((section) => ({
        ...section,
        questions: section.questions.map((question) => ({
          ...question,
          maxSelect: question.maxSelect || 1, // Default to 1 if not provided
          ratingLevel: question.ratingLevel || 1, // Default to 1 if not provided
        })),
      }));
      setSections(updatedSections);
    }
  }, [quizData]);
  

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

  const updateOption = (sectionId, questionId, optionId, value) => {
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
                          ? { ...option, text: value }
                          : option
                      ),
                    }
                  : question
              ),
            }
          : section
      )
    );
  
    // Autosave the updated option using option_id
    autosaveOption(questionId, optionId, { text: value });
  };
  
  
  const autosaveOption = async (questionId, optionId, updates) => {
    try {
      const response = await axios.patch(
        `http://localhost:3001/form/${questionId}/options/${optionId}`,
        updates
      );
    } catch (error) {
      console.error("Option autosave failed:", error);
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
      // เรียก API เพื่อเพิ่ม Option
      const response = await axios.post(
        `http://localhost:3001/form/${questionId}/options`,
        { text: "ตัวเลือกใหม่" }
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
  

  const toggleCorrectOption = (sectionId, questionId, optionIdx) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.id === questionId
                  ? {
                      ...question,
                      correctOptions: question.correctOptions?.includes(
                        optionIdx
                      )
                        ? question.correctOptions.filter(
                            (idx) => idx !== optionIdx
                          )
                        : [...(question.correctOptions || []), optionIdx],
                    }
                  : question
              ),
            }
          : section
      )
    );
  };

  const setCorrectOption = (sectionId, questionId, optionIdx) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.id === questionId
                  ? { ...question, correctOption: optionIdx } // Update the correct option for single-answer
                  : question
              ),
            }
          : section
      )
    );
  };

  const addCorrectAnswer = (sectionId, questionId) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.id === questionId
                  ? {
                      ...question,
                      correctAnswers: [...(question.correctAnswers || []), ""],
                    }
                  : question
              ),
            }
          : section
      )
    );
  };
  const removeCorrectAnswer = (sectionId, questionId) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.id === questionId
                  ? {
                      ...question,
                      correctAnswers: question.correctAnswers.slice(0, -1),
                    }
                  : question
              ),
            }
          : section
      )
    );
  };
  const updateCorrectAnswer = (sectionId, questionId, idx, value) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.id === questionId
                  ? {
                      ...question,
                      correctAnswers: question.correctAnswers.map(
                        (answer, index) => (index === idx ? value : answer)
                      ),
                    }
                  : question
              ),
            }
          : section
      )
    );
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
  

  const toggleRequired = (sectionId, questionId) => {
    const updatedSections = sections.map((section) => {
      if (section.section_id === sectionId) {
        return {
          ...section,
          questions: section.questions.map((question) => {
            if (question.question_id === questionId) {
              const updatedQuestion = {
                ...question,
                isRequired: !question.isRequired,
              };
              // Autosave question's required state
              handleAutosaveForQuestion(sectionId, questionId, {
                required: updatedQuestion.isRequired,
              });
              return updatedQuestion;
            }
            return question;
          }),
        };
      }
      return section;
    });

    setSections(updatedSections);
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
              section={section} /* other props */
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
    <div className="min-h-screen bg-gray-100 py-8">
      <CoverPage coverPageData={quizData?.coverPage} theme={quizData?.theme} />
      {renderSectionComponent()}
    </div>
  );
}
