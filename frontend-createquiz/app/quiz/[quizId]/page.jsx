"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function QuizPage({ params }) {
  const { quizId } = params;
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const router = useRouter();

  useEffect(() => {
    // Fetch quiz data from Express.js backend
    async function fetchQuiz() {
      try {
        const response = await axios.get(`http://localhost:3001/form/${quizId}`);
        const data = response.data;

        // Restructure data for easier use
        const formattedQuiz = {
          title: data.coverPage.title,
          description: data.coverPage.description,
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
    }

    fetchQuiz();
  }, [quizId]);

  const handleInputChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleDeleteQuiz = async () => {
    try {
      const response = await axios.delete(`http://localhost:3001/form/${quizId}`);
      if (response.status === 200) {
        alert("Quiz deleted successfully");
      }
      router.push("/home"); // Redirect to home page
    } catch (error) {
      console.error("Error deleting quiz:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(answers); // Handle submission logic here
  };

  if (!quiz) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4 text-black">{quiz.title}</h1>
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
        </button>
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
            onChange={(e) =>
              handleInputChange(question.id, e.target.value)
            }
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
                  onChange={(e) =>
                    handleInputChange(question.id, rating)
                  }
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
            onChange={(e) =>
              handleInputChange(question.id, e.target.value)
            }
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
            onChange={(e) =>
              handleInputChange(question.id, e.target.value)
            }
          />
        </div>
      );
    default:
      return null;
  }
}
