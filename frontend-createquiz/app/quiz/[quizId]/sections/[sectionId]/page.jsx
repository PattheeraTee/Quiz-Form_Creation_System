"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import QuizHeader from "@/app/quiz/header/page";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BackgroundHorizental from "../../../../components/images/backgroud-cloud-horizental.svg";
import Image from "next/image";

export default function SectionPage({ params, searchParams }) {
  const { quizId, sectionId } = params;
  const router = useRouter();
  const [section, setSection] = useState(null);
  const [allSections, setAllSections] = useState([]);
  const [responses, setResponses] = useState({});
  const [allResponses, setAllResponses] = useState(
    searchParams.allResponses ? JSON.parse(searchParams.allResponses) : []
  );
  const [theme, setTheme] = useState(
    searchParams.theme
      ? JSON.parse(decodeURIComponent(searchParams.theme))
      : null
  );

  const fetchTheme = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/form/${quizId}`);
      const data = response.data;

      setTheme({
        primaryColor: data.theme.primary_color,
      });
    } catch (error) {
      console.error("Error fetching theme:", error);
    }
  };

  useEffect(() => {
    fetchTheme();
  }, [quizId]);

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/form/${quizId}`
        );
        const data = response.data;

        const formattedSections = (data.sections || []).map((section) => {
          let questions = section.questions || [];

          // เช็คว่าแบบฟอร์มตั้งค่าให้สุ่มคำถามหรือไม่
          if (data.form.shuffle_question) {
            questions = shuffleArray([...questions]);
          }

          return {
            id: section.section_id || "unknown_id",
            title: section.title || null,
            description: section.description || null,
            questions: questions.map((question) => ({
              id: question.question_id || "unknown_question_id",
              text: question.question || "Untitled Question",
              type: question.type || "unknown_type",
              required: question.required || false,
              options: (question.options || []).map((option) => ({
                id: option.option_id || "unknown_option_id",
                text: option.text || "Untitled Option",
              })),
              limit: question.limit || null,
            })),
          };
        });

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

  const handleNext = () => {
    if (validateResponses()) {
      const currentResponses = saveCurrentResponses();
      const currentIndex = allSections.findIndex((sec) => sec.id === sectionId);
      const nextSectionId = allSections[currentIndex + 1]?.id;
      if (nextSectionId) {
        const encodedResponses = encodeURIComponent(
          JSON.stringify([...allResponses, ...currentResponses])
        );
        const encodedTheme = encodeURIComponent(JSON.stringify(theme));
        router.push(
          `/quiz/${quizId}/sections/${nextSectionId}?allResponses=${encodedResponses}&theme=${encodedTheme}`
        );
      }
    }
  };

  const handlePrevious = () => {
    const currentIndex = allSections.findIndex((sec) => sec.id === sectionId);
    const prevSectionId = allSections[currentIndex - 1]?.id;
    if (prevSectionId) {
      const encodedResponses = encodeURIComponent(JSON.stringify(allResponses));
      const encodedTheme = encodeURIComponent(JSON.stringify(theme));
      router.push(
        `/quiz/${quizId}/sections/${prevSectionId}?allResponses=${encodedResponses}&theme=${encodedTheme}`
      );
    } else {
      router.push(`/quiz/${quizId}`);
    }
  };

  const handleSubmit = async () => {
    if (validateResponses()) {
      const finalResponses = saveCurrentResponses();
      let payload = {
        form_id: quizId,
        answers: [...allResponses, ...finalResponses],
      };

      try {
        // 🔹 ตรวจสอบ cookie ว่ามี userId หรือไม่
        const cookieResponse = await axios.get(
          "http://localhost:3000/api/getCookie",
          {
            withCredentials: true,
          }
        );

        const userId = cookieResponse.data.userId;

        if (userId) {
          // 🔹 ดึงข้อมูล user ถ้ามี userId
          const userResponse = await axios.get(
            `http://localhost:3001/users/${userId}`,
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          );

          const userEmail = userResponse.data.email;
          if (userEmail) {
            payload.email = userEmail; // 🔹 เพิ่ม email ใน payload ถ้ามี
          }
        }
      } catch (error) {
        console.warn(
          "No valid cookie or user data found, submitting without email."
        );
      }

      try {
        const response = await axios.post(
          "http://localhost:3001/response/submit",
          payload
        );
        console.log("Submission response:", response.data);
        // console.log("Submission payload:", payload);
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
        question.required &&
        (responses[question.id] === undefined ||
          responses[question.id]?.length === 0)
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
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `linear-gradient(to bottom, ${theme.primaryColor}10, ${theme.primaryColor})`,
      }}
    >
      <QuizHeader />
      <div
        className="flex-grow flex items-center justify-center p-8"
        style={{
          backgroundImage: `url(${BackgroundHorizental.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative z-10">
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
