"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import QuizHeader from "@/app/quiz/header/page";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SectionPage({ params,searchParams }) {
  const { quizId, sectionId } = params;
  const router = useRouter();
  const [section, setSection] = useState(null);
  const [allSections, setAllSections] = useState([]);
  const [responses, setResponses] = useState({}); 
  const [allResponses, setAllResponses] = useState(
    searchParams.allResponses ? JSON.parse(searchParams.allResponses) : []
  );

  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/form/${quizId}`
        );
        const data = response.data;

        const formattedSections = (data.sections || []).map((section) => ({
          id: section.section_id || "unknown_id",
          title: section.title || null, // Set null if no title
          description: section.description || null, // Set null if no description
          questions: (section.questions || []).map((question) => ({
            id: question.question_id || "unknown_question_id",
            text: question.question || "Untitled Question",
            type: question.type || "unknown_type",
            required: question.required || false, // Include required field
            options: (question.options || []).map((option) => ({
              id: option.option_id || "unknown_option_id",
              text: option.text || "Untitled Option",
            })),
            limit: question.limit || null, // Add limit for specific question types
          })),
        }));

        setAllSections(formattedSections);

        const currentSection = formattedSections.find(
          (sec) => sec.id === sectionId
        );
        setSection(currentSection);
      } catch (error) {
        console.error("Error fetching section data:", error);
      }
    };

    fetchSectionData();
  }, [quizId, sectionId]);

  const handleInputChange = (questionId, value) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId, value, limit) => {
    const selected = responses[questionId] || [];
    if (selected.includes(value)) {
      // Remove the selected value
      setResponses((prev) => ({
        ...prev,
        [questionId]: selected.filter((item) => item !== value),
      }));
    } else if (selected.length < limit) {
      // Add new value if limit is not exceeded
      setResponses((prev) => ({
        ...prev,
        [questionId]: [...selected, value],
      }));
    }
  };

  const saveCurrentResponses = () => {
    const currentResponses = section.questions
      .map((question) => {
        const response = responses[question.id];

        if (!response || (Array.isArray(response) && response.length === 0)) {
          return null;
        }

        switch (question.type) {
          case "multiple_choice":
          case "dropdown":
          case "checkbox":
            const selectedOptions = question.options.filter((option) =>
              Array.isArray(response)
                ? response.includes(option.text)
                : response === option.text
            );
            return {
              question_id: question.id,
              type: question.type,
              option_id: selectedOptions.map((opt) => opt.id),
            };
          case "rating":
            return {
              question_id: question.id,
              type: question.type,
              answer_rating: response || null,
            };
          case "text_input":
            return {
              question_id: question.id,
              type: question.type,
              answer_text: response || "",
            };
          case "date":
            return {
              question_id: question.id,
              type: question.type,
              answer_date: response || null,
            };
          default:
            return null;
        }
      })
      .filter((answer) => answer !== null);

    setAllResponses((prev) => [...prev, ...currentResponses]);
    return currentResponses; // Return to pass along in query params
  };

  useEffect(() => {
    console.log("All responses:", allResponses);
  }, [allResponses]);

  const handleNext = () => {
    if (validateResponses()) {
      const currentResponses = saveCurrentResponses();
      const currentIndex = allSections.findIndex((sec) => sec.id === sectionId);
      const nextSectionId = allSections[currentIndex + 1]?.id;
      if (nextSectionId) {
        const encodedResponses = encodeURIComponent(
          JSON.stringify([...allResponses, ...currentResponses])
        );
        router.push(
          `/quiz/${quizId}/sections/${nextSectionId}?allResponses=${encodedResponses}`
        );
      }
    }
  };  

  const handlePrevious = () => {
    const currentIndex = allSections.findIndex((sec) => sec.id === sectionId);
    const prevSectionId = allSections[currentIndex - 1]?.id;
    if (prevSectionId) {
      const encodedResponses = encodeURIComponent(
        JSON.stringify(allResponses)
      );
      router.push(
        `/quiz/${quizId}/sections/${prevSectionId}?allResponses=${encodedResponses}`
      );
    } else {
      router.push(`/quiz/${quizId}`);
    }
  };  

  const handleSubmit = async () => {
    if (validateResponses()) {
      const finalResponses = saveCurrentResponses();
      const payload = {
        form_id: quizId,
        email: "testuser@example.com",
        answers: [...allResponses, ...finalResponses],
      };

      try {
        const response = await axios.post("http://localhost:3001/response/submit", payload);
        console.log("Submission response:", response.data);
        router.push(`/quiz/${quizId}/success`);
      } catch (error) {
        console.error("Error submitting responses:", error);
        alert("เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองอีกครั้ง");
      }
    }
  };

  const validateResponses = () => {
    const unansweredRequiredQuestions = section.questions.filter(
      (question) =>
        question.required && (responses[question.id] === undefined || responses[question.id]?.length === 0)
    );

    if (unansweredRequiredQuestions.length > 0) {
      alert("กรุณาตอบคำถามที่จำเป็นทั้งหมดก่อนดำเนินการต่อ");
      return false;
    }

    return true;
  };

  if (!section || !allSections.length) return <div>Loading...</div>;

  const isLastSection =
    allSections.findIndex((sec) => sec.id === sectionId) ===
    allSections.length - 1;

  return (
    <div>
      <QuizHeader />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
          {section.title && (
            <h1 className="text-xl font-bold mb-4">{section.title}</h1>
          )}
          {section.description && (
            <p className="text-gray-600 mb-6">{section.description}</p>
          )}

          {section.questions.map((question) => (
            <QuestionComponent
              key={question.id}
              question={question}
              handleInputChange={handleInputChange}
              handleCheckboxChange={handleCheckboxChange}
              responses={responses}
            />
          ))}

          <div className="flex justify-between mt-4">
            <button
              onClick={handlePrevious}
              className="px-6 py-2 text-white bg-gray-500 rounded-lg hover:bg-gray-600"
            >
              ก่อนหน้า
            </button>

            {isLastSection ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
              >
                ส่ง
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                ถัดไป
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionComponent({
  question,
  handleInputChange,
  handleCheckboxChange,
  responses,
}) {
  switch (question.type) {
    case "multiple_choice":
      return (
        <div className="mb-4">
          <p className="font-medium mb-2">
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </p>
          {question.options.map((option) => (
            <div key={option.id} className="mb-1">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name={question.id}
                  value={option.text}
                  className="form-radio h-4 w-4 text-blue-600"
                  onChange={(e) =>
                    handleInputChange(question.id, e.target.value)
                  }
                />
                <span className="ml-2">{option.text}</span>
              </label>
            </div>
          ))}
        </div>
      );
    case "checkbox":
      return (
        <div className="mb-4">
          <p className="font-medium mb-2">
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </p>
          {question.limit && (
            <p className="text-sm text-gray-500 mb-2">
              เลือกได้สูงสุด {question.limit} ตัวเลือก
            </p>
          )}
          {question.options.map((option) => (
            <div key={option.id} className="mb-1">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  value={option.text}
                  className="form-checkbox h-4 w-4 text-blue-600"
                  onChange={(e) =>
                    handleCheckboxChange(
                      question.id,
                      e.target.value,
                      question.limit || Infinity
                    )
                  }
                  checked={(responses[question.id] || []).includes(option.text)}
                />
                <span className="ml-2">{option.text}</span>
              </label>
            </div>
          ))}
        </div>
      );
    case "dropdown":
      return (
        <div className="mb-4">
          <p className="font-medium mb-2">
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </p>
          <select
            className="form-select block w-full mt-1 border border-gray-300 rounded px-2 py-1.5"
            onChange={(e) => handleInputChange(question.id, e.target.value)}
          >
            <option value="">เลือกคำตอบ</option>
            {question.options.map((option) => (
              <option key={option.id} value={option.text}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
      );
    case "rating":
      return (
        <div className="mb-4">
          <p className="font-medium mb-2">
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </p>
          <div className="flex items-center space-x-2">
            {Array.from({ length: question.limit || 5 }, (_, i) => i + 1).map(
              (rating) => (
                <label key={rating} className="inline-flex items-center">
                  <input
                    type="radio"
                    name={question.id}
                    value={rating}
                    className="hidden"
                    onChange={() => handleInputChange(question.id, rating)}
                  />
                  <FontAwesomeIcon
                    icon={faStar}
                    className={`cursor-pointer ${
                      (responses[question.id] || 0) >= rating
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </label>
              )
            )}
          </div>
        </div>
      );
    case "text_input":
      return (
        <div className="mb-4">
          <p className="font-medium mb-2">
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </p>
          <textarea
            className="form-textarea block w-full mt-1 border border-gray-300 rounded"
            onChange={(e) => handleInputChange(question.id, e.target.value)}
          />
        </div>
      );
    case "date":
      return (
        <div className="mb-4">
          <p className="font-medium mb-2">
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </p>
          <input
            type="date"
            className="form-input block w-full mt-1 border border-gray-300 rounded px-2 py-1.5"
            onChange={(e) => handleInputChange(question.id, e.target.value)}
          />
        </div>
      );
    default:
      return null;
  }
}
