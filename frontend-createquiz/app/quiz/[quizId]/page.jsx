"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import QuizHeader from "../header/page";
import Background from "../../components/images/backgroud-cloud-horizental.svg";
import Image from "next/image";

export default function QuizPage({ params }) {
  const { quizId } = params;
  const [quiz, setQuiz] = useState(null);
  const [coverPage, setCoverPage] = useState(null);
  const [theme, setTheme] = useState(null);
  const [answers, setAnswers] = useState({});
  const router = useRouter();

  const fetchCoverPage = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/form/${quizId}`);
      const data = response.data;

      setCoverPage({
        title: data.coverPage.title,
        textButton: data.coverPage.text_button,
      });
    } catch (error) {
      console.error("Error fetching cover page:", error);
    }
  };

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/form/${quizId}`);
      const data = response.data;

      const formattedQuiz = {
        sections: data.sections.map((section) => ({
          id: section.section_id,
          title: section.title,
          description: section.description,
          questions: section.questions.map((question) => ({
            id: question.question_id,
            text: question.question,
            type: question.type,
            options: question.options.map((option) => ({
              id: option.option_id,
              text: option.text,
            })),
          })),
        })),
      };

      setQuiz(formattedQuiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
    }
  };

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
    fetchCoverPage();
    fetchQuiz();
    fetchTheme();
  }, [quizId]);

  const handleInputChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleDeleteQuiz = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:3001/form/${quizId}`
      );
      if (response.status === 200) {
        alert("Quiz deleted successfully");
      }
      router.push("/home");
    } catch (error) {
      console.error("Error deleting quiz:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(answers);
  };

  // Show a loading state until all required data is fetched
  if (!quiz || !theme || !coverPage) return <div>Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <QuizHeader />

      {/* Quiz Content */}
      <div
  className="flex-grow flex items-center justify-center"
  style={{
    backgroundImage: `url(${Background.src})`,
    backgroundColor: theme.primaryColor,
    backgroundSize: "cover",
    backgroundBlendMode: "overlay",
  }}
>        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
          <div className="flex flex-col items-center mb-6">
            <div className="w-full h-72 object-cover mb-4 rounded-xl"
                            style={{ backgroundColor: theme.primaryColor }}

            >
              <Image
                src={Background}
                alt="Background"
                className="w-full h-72 object-cover mb-4 rounded-xl"
              />
            </div>
            <div className="flex flex-col items-center text-center">
              <h1 className="text-2xl font-bold text-black mb-2">
                {coverPage.title}
              </h1>
              <p className="text-gray-600 mb-4">
                {coverPage.description}
              </p>
              <button
                className="px-6 py-2 mt-4 text-white rounded-full hover:opacity-90 transition"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {coverPage.textButton}
              </button>
            </div>
          </div>
          {/* <h1 className="text-2xl font-bold mb-4 text-black">{quiz.title}</h1>
          <p className="mb-6 text-gray-600">{quiz.description}</p>
          <form onSubmit={handleSubmit}>
            {quiz.sections.map((section) => (
              <div key={section.id} className="mb-6">
                <h2 className="text-xl font-semibold mb-2 text-black">
                  {section.title}
                </h2>
                <p className="mb-4 text-gray-500">{section.description}</p>
                {section.questions.map((question) => (
                  <QuestionComponent
                    key={question.id}
                    question={question}
                    handleInputChange={handleInputChange}
                  />
                ))}
              </div>
            ))}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300"
            >
              ส่ง
            </button>
          </form>
          <button
            onClick={handleDeleteQuiz}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-300 mt-4"
          >
            ลบแบบทดสอบ
          </button> */}
        </div>
      </div>
    </div>
  );
}

function QuestionComponent({ question, handleInputChange }) {
  switch (question.type) {
    case "multiple_choice":
      return (
        <div className="mb-4">
          <p className="font-medium mb-2 text-black">{question.text}</p>
          {question.options.map((option) => (
            <div key={option.id} className="mb-1">
              <label className="inline-flex items-center text-black">
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
          <p className="font-medium mb-2 text-black">{question.text}</p>
          {question.options.map((option) => (
            <div key={option.id} className="mb-1">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  value={option.text}
                  className="form-checkbox h-4 w-4 text-blue-600"
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
    case "dropdown":
      return (
        <div className="mb-4">
          <p className="font-medium mb-2">{question.text}</p>
          <select
            className="form-select block w-full mt-1"
            onChange={(e) => handleInputChange(question.id, e.target.value)}
          >
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
          <p className="font-medium mb-2">{question.text}</p>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <label key={rating} className="inline-flex items-center">
                <input
                  type="radio"
                  name={question.id}
                  value={rating}
                  className="form-radio h-4 w-4 text-blue-600"
                  onChange={(e) => handleInputChange(question.id, rating)}
                />
                <span className="ml-1">{rating}</span>
              </label>
            ))}
          </div>
        </div>
      );
    case "text_input":
      return (
        <div className="mb-4">
          <p className="font-medium mb-2">{question.text}</p>
          <textarea
            className="form-textarea block w-full mt-1"
            onChange={(e) => handleInputChange(question.id, e.target.value)}
          />
        </div>
      );
    case "date":
      return (
        <div className="mb-4">
          <p className="font-medium mb-2">{question.text}</p>
          <input
            type="date"
            className="form-input block w-full mt-1"
            onChange={(e) => handleInputChange(question.id, e.target.value)}
          />
        </div>
      );
    default:
      return null;
  }
}
