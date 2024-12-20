// pages/create-quiz.js
"use client";
import { useState } from "react";
import CoverPage from "./coverpage/page";
import Section from "./section/page";
import SectionQuiz from "./section-quiz/page";
import { v4 as uuidv4 } from "uuid";

export default function CreateQuiz() {
  const questionTypes = [
    { label: "คำถามเลือกตอบ", icon: "⭕", value: "multiple_choice" },
    { label: "ช่องกาเครื่องหมาย", icon: "✔️", value: "checkbox" },
    { label: "ดรอปดาวน์", icon: "⬇️", value: "dropdown" },
    { label: "การให้คะแนน", icon: "⭐", value: "rating" },
    { label: "เติมคำตอบ", icon: "✍️", value: "text_input" },
    { label: "วันที่", icon: "📅", value: "date" },
  ];
  const [sections, setSections] = useState([
    {
      id: 1,
      title: "",
      description: "",
      questions: [],
      showQuestionTypes: false,
    },
  ]);

  const addSection = () => {
    const newSection = {
      id: sections.length + 1,
      title: "",
      description: "",
      questions: [],
      showQuestionTypes: false,
    };
    setSections([...sections, newSection]);
  };

  const addQuestion = (sectionId, type) => {
    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: [
            ...section.questions,
            {
              id: section.questions.length + 1,
              type,
              options:
                type !== "text_input" &&
                type !== "date" &&
                type !== "rating"
                  ? [""]
                  : [],
              correctAnswers: type === "text_input" ? [""] : [], // Add this line
              maxSelect: 1,
              isRequired: false,
              ratingLevel: type === "rating" ? 5 : null,
            },
          ],
          showQuestionTypes: false,
        };
      }
      return section;
    });
    setSections(updatedSections);
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

  const deleteSection = (sectionId) => {
    if (sectionId === 1) return;
    const updatedSections = sections
      .filter((section) => section.id !== sectionId)
      .map((section, index) => ({ ...section, id: index + 1 }));
    setSections(updatedSections);
  };

  const toggleAddQuestionVisibility = (sectionId) => {
    setShowAddQuestion((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const toggleQuestionTypesVisibility = (sectionId) => {
    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        return { ...section, showQuestionTypes: !section.showQuestionTypes };
      }
      return section;
    });
    setSections(updatedSections);
  };

  const createQuiz = () => {
    const quizId = uuidv4();
    const payload = {
      id: uuidv4(),
      quizId: quizId,
      userId: "user2",
      type: "แบบสำรวจ",
      coverPage: {
        id: uuidv4(),
        quizId: quizId,
        quizTitle: "ชื่อแบบทดสอบที่ผู้ใช้กรอก",
        description: "คำอธิบายที่ผู้ใช้กรอก",
        buttonText: "เริ่มต้น",
        imagePath: null,
      },
      sections: sections.map((section, index) => ({
        id: uuidv4(),
        sectionId: uuidv4(),
        sectionNumber: index + 1,
        sectionTitle: section.title,
        sectionDescription: section.description,
        quizId: quizId,
        questions: section.questions.map((question) => ({
          id: uuidv4(),
          questionId: uuidv4(),
          type: question.type,
          text: question.text,
          imagePath: null,
          required: question.isRequired,
          points: 0,
          sectionId: uuidv4(),
          options: question.options.map((option) => ({
            id: uuidv4(),
            optionId: uuidv4(),
            text: option,
            imagePath: null,
            weight: null,
          })),
        })),
      })),
    };

    fetch("http://localhost:3001/quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Quiz created:", data);
      })
      .catch((error) => {
        console.error("Error creating quiz:", error);
      });
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
  
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <CoverPage />
      {sections.map((section) => (
        <Section
        // <SectionQuiz
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
          addCorrectAnswer={addCorrectAnswer} // Pass addCorrectAnswer
          removeCorrectAnswer={removeCorrectAnswer} // Pass removeCorrectAnswer
          updateCorrectAnswer={updateCorrectAnswer} // Pass updateCorrectAnswer
          updatePoints={updatePoints} // Pass updatePoints
          handleUploadImage={handleUploadImage} // Pass handle
        />
      ))}
      <div className="max-w-2xl mx-auto mt-8">
        <button
          className="w-full mt-2 px-4 py-2 bg-[#03A9F4] text-white rounded-full"
          onClick={createQuiz} // เพิ่มฟังก์ชันที่ต้องการให้ทำงานเมื่อกดปุ่ม
        >
          สร้างแบบทดสอบ
        </button>
      </div>
    </div>
  );
}
