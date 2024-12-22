"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import CoverPage from "./coverpage/page";
import SectionQuiz from "./section-quiz/page";
import SectionForm from "./section-form/page";
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
    question: "คำถามจ้า", // คำถามเริ่มต้น
    options: [], // กำหนดค่าเริ่มต้นให้ options
    correctAnswers: type === "text_input" ? [""] : [], // คำตอบที่ถูกต้องเฉพาะประเภท text_input
    maxSelect: type === "checkbox" ? 1 : null, // ค่า maxSelect เฉพาะประเภท checkbox
    isRequired: false,
    ratingLevel: type === "rating" ? 10 : null, // ค่าเริ่มต้นสำหรับ rating
  };

  // เตรียม Payload โดยไม่รวม `options` ถ้าไม่ใช่ประเภทที่ต้องการ
  const payload = {
    type: newQuestion.type,
    question: newQuestion.question,
  };

  // เพิ่ม `options` ใน Payload เฉพาะประเภทที่ต้องการ
  if (type === "multiple_choice" || type === "checkbox" || type === "dropdown") {
    payload.options = [""];
  }

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
            questions: [...section.questions, { ...newQuestion, ...response.data }],
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

  
  

  const updateOption = (sectionId, questionId, optionIndex, value) => {
    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map((question) => {
            if (question.id === questionId) {
              const updatedOptions = [...question.options];
              updatedOptions[optionIndex] = value;
              return { ...question, options: updatedOptions };
            }
            return question;
          }),
        };
      }
      return section;
    });
    setSections(updatedSections);
  };

  const updateRatingLevel = (sectionId, questionId, value) => {
    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map((question) => {
            if (question.id === questionId && question.type === "rating") {
              return { ...question, ratingLevel: value };
            }
            return question;
          }),
        };
      }
      return section;
    });
    setSections(updatedSections);
  };

  const addOption = (sectionId, questionId) => {
    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map((question) => {
            if (question.id === questionId) {
              return { ...question, options: [...question.options, ""] };
            }
            return question;
          }),
        };
      }
      return section;
    });
    setSections(updatedSections);
  };

  const removeOption = (sectionId, questionId, optionIndex) => {
    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map((question) => {
            const updatedOptions = question.options.filter(
              (_, idx) => idx !== optionIndex
            );
            return { ...question, options: updatedOptions };
          }),
        };
      }
      return section;
    });
    setSections(updatedSections);
  };

  const updateMaxSelect = (sectionId, questionId, value) => {
    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map((question) => {
            if (question.id === questionId && question.type === "checkbox") {
              return { ...question, maxSelect: value };
            }
            return question;
          }),
        };
      }
      return section;
    });
    setSections(updatedSections);
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

  const updatePoints = (sectionId, questionId, value) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.id === questionId
                  ? { ...question, points: parseInt(value) || 0 }
                  : question
              ),
            }
          : section
      )
    );
  };

  const toggleRequired = (sectionId, questionId) => {
    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map((question) => {
            if (question.id === questionId) {
              return { ...question, isRequired: !question.isRequired };
            }
            return question;
          }),
        };
      }
      return section;
    });
    setSections(updatedSections);
  };

  const deleteQuestion = (sectionId, questionId) => {
    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.filter(
            (question) => question.id !== questionId
          ),
        };
      }
      return section;
    });
    setSections(updatedSections);
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
            section.id === sectionId
              ? {
                  ...section,
                  questions: section.questions.map((question) =>
                    question.id === questionId
                      ? {
                          ...question,
                          ...(optionIdx !== null
                            ? {
                                // Update image for a specific option
                                options: question.options.map((option, idx) =>
                                  idx === optionIdx
                                    ? { ...option, image: reader.result }
                                    : option
                                ),
                              }
                            : {
                                // Update image for the question itself
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
    const updatedSections = sections.map((sec) =>
      sec.id === sectionId ? { ...sec, title: newTitle } : sec
    );
    setSections(updatedSections);
  };

  const updateSectionDescription = (sectionId, newDescription) => {
    const updatedSections = sections.map((sec) =>
      sec.id === sectionId ? { ...sec, description: newDescription } : sec
    );
    setSections(updatedSections);
  };

  const renderSectionComponent = () => {
    if (!Array.isArray(sections) || sections.length === 0) {
      // console.error("No valid sections available");
      return <div className="text-center mt-5">No valid sections available</div>;
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
            />
          );
        case "survey":
          return (
            <SectionForm
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

      <div className="max-w-2xl mx-auto mt-8">
        <button className="w-full mt-2 px-4 py-2 bg-[#03A9F4] text-white rounded-full">
          สร้างแบบทดสอบ
        </button>
      </div>
    </div>
  );
}
