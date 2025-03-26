"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { QuizProvider } from "./QuizContext"; // Import QuizProvider
import Question from "./question/page";
import HeaderQuiz from "./header/page";
import Setting from "./settings/page";
import Response from "../components/response/page";
import axios from "axios";

export default function CreateQuiz() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const formId = searchParams.get("form_id");
  const [selectedTab, setSelectedTab] = useState("คำถาม");
  const [quizData, setQuizData] = useState(null);
  const [sections, setSections] = useState([]);
  
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/form/${formId}`);
        setQuizData(res.data);
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      }
    };
  
    // โหลดข้อมูลใหม่ทุกครั้งที่กลับมา tab "คำถาม"
    if (selectedTab === "คำถาม" && formId) {
      fetchQuizData();
    }
  }, [selectedTab, formId]);

  const handleTabSelect = (tab) => {
    console.log("Selected Tab:", tab);
    setSelectedTab(tab);
  };

  return (
    <QuizProvider 
    initialQuizTitle={quizData?.coverPage?.title || "Untitled Form"}
    initialPrimaryColor={quizData?.theme?.primary_color || "#FFFFFF"}
    >
      <div className="bg-gray-100 min-h-screen">
      <HeaderQuiz
          quizData={quizData}
          selectedSection={selectedTab}
          onSectionSelect={handleTabSelect}
        />
        {selectedTab === "คำถาม" && <Question quizData={quizData} />}
        {selectedTab === "การตอบกลับ" && <Response quizId={formId} formType={type} />}
        {selectedTab === "ตั้งค่า" && <Setting />}
      </div>
    </QuizProvider>
  );
}
