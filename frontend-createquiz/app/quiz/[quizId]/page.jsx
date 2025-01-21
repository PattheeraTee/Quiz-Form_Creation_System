"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import QuizHeader from "../header/page";
import Background from "../../components/images/backgroud-cloud-horizental.svg";
import Image from "next/image";

export default function Coverpage({ params }) {
  const { quizId } = params;
  const [quiz, setQuiz] = useState(null);
  const [coverPage, setCoverPage] = useState(null);
  const [theme, setTheme] = useState(null);
  const router = useRouter();

  const fetchCoverPage = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/form/${quizId}`);
      const data = response.data;

      setCoverPage({
        title: data.coverPage.title,
        description: data.coverPage.description,
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

  const handleStartQuiz = () => {
    if (quiz && quiz.sections.length > 0) {
      const firstSectionId = quiz.sections[0].id;
      console.log(firstSectionId);
      router.push(`/quiz/${quizId}/sections/${firstSectionId}`);
    } else {
      console.error("No sections available to start the quiz.");
    }
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
          background: `linear-gradient(to bottom, ${theme.primaryColor}10, ${theme.primaryColor})`, // สีอ่อนลงอีก 40%
          backgroundSize: "cover",
          backgroundBlendMode: "overlay",
        }}
      >
        {" "}
        <div className="bg-white px-8 py-6 rounded-xl shadow-lg w-full max-w-lg">
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-full h-72 object-cover mb-4 rounded-xl"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <Image
                src={Background}
                alt="Background"
                className="w-full h-72 object-cover mb-4 rounded-xl"
              />
            </div>
            <div className="flex flex-col items-center text-center">
              <h1 className="text-2xl font-bold text-black mb-6 mt-2">
                {coverPage.title}
              </h1>
              <p className="text-gray-600 mb-6">{coverPage.description}</p>
              <button
                onClick={handleStartQuiz}
                className="px-6 py-2 text-white rounded-full hover:opacity-90 transition"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {coverPage.textButton}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
