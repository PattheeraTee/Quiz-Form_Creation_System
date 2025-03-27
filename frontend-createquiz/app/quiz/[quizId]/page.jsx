"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import QuizHeader from "../header/page";
import Background from "../../components/images/backgroud-cloud-horizental.svg";
import Image from "next/image";

export default function Coverpage({ params }) {
  const { quizId } = params;
  const [quiz, setQuiz] = useState(null);
  const [coverPage, setCoverPage] = useState(null);
  const [theme, setTheme] = useState(null);
  const [formStatus, setFormStatus] = useState(null);
  const router = useRouter();

  const fetchFormData = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/form/${quizId}`);
      const formData = response.data;
  
      const now = new Date();
      const timeZoneOffset = 7 * 60 * 60 * 1000;
      const startDate = formData.form.start_date ? new Date(new Date(formData.form.start_date).getTime() - timeZoneOffset) : null;
      const endDate = formData.form.end_date ? new Date(new Date(formData.form.end_date).getTime() - timeZoneOffset) : null;
  
      // ✅ ตั้งค่า coverPage และ theme ก่อนเสมอ
      setCoverPage({
        title: formData.coverPage.title,
        description: formData.coverPage.description,
        textButton: formData.coverPage.text_button,
      });
      setTheme({ primaryColor: formData.theme.primary_color });
  
      // ✅ ตั้งค่า quiz
      const formattedQuiz = {
        sections: formData.sections.map((section) => ({
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
  
      // ✅ ตรวจสอบสถานะฟอร์ม
      if (!formData.form.is_form_open) {
        setFormStatus("closed");
        return;
      } else if (startDate && now < startDate) {
        setFormStatus("not_started");
        return;
      } else if (endDate && now > endDate) {
        setFormStatus("closed");
        return;
      }
  
      // ✅ ตรวจสอบ email_require หรือ limit_one_response
      if (formData.form.email_require || formData.form.limit_one_response) {
        try {
          console.log("==================")
          const cookieResponse = await axios.get("http://localhost:3000/api/getCookie", {
            withCredentials: true,
          });
          const userId = cookieResponse.data.userId;
          console.log("User ID:", userId);
  
          if (!userId) {
            Swal.fire({
              icon: "warning",
              title: "กรุณาล็อกอิน",
              text: "คุณต้องล็อกอินก่อนทำแบบฟอร์มนี้",
              confirmButtonText: "ไปที่หน้าล็อกอิน",
              allowOutsideClick: false,
            }).then(() => {
              window.location.href = `http://localhost:3000?redirect=/quiz/${quizId}`;
            });
            return;
          }
  
          if (formData.form.limit_one_response) {
            const userResponse = await axios.get(`http://localhost:3001/users/${userId}`, {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            });
  
            const userEmail = userResponse.data.email;
  
            const detailResponse = await axios.get(
              `http://localhost:3001/response/form/${quizId}/detail?type=${formData.form.form_type}`
            );
  
            const allUserResponses = detailResponse.data.userResponses || [];
  
            const alreadyAnswered = allUserResponses.some(
              (entry) => entry.email === userEmail
            );
  
            if (alreadyAnswered) {
              setFormStatus("already_answered"); // ✅ ตั้งค่า แต่ไม่ return
              return;
            }
          }
        } catch (error) {
          console.error("Error checking login or duplicate response:", error);
        }
      }
  
      // ✅ ถ้ายังไม่เคยตอบเลย
      setFormStatus("open");
  
    } catch (error) {
      console.error("Error fetching form data:", error);
    }
  };
  

  useEffect(() => {
    fetchFormData();
  }, [quizId]);

  useEffect(() => {
    console.log("Form status:", formStatus);
  }, [formStatus]);

  const handleStartQuiz = () => {
    if (quiz && quiz.sections.length > 0) {
      const firstSectionId = quiz.sections[0].id;
      router.push(`/quiz/${quizId}/sections/${firstSectionId}`);
    } else {
      console.error("No sections available to start the quiz.");
    }
  };

  if (!coverPage || !theme || formStatus === null) return <div>Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <QuizHeader />

      {/* Quiz Content */}
      <div
        className="flex-grow flex items-center justify-center"
        style={{
          background: `linear-gradient(to bottom, ${theme.primaryColor}10, ${theme.primaryColor})`,
          backgroundSize: "cover",
          backgroundBlendMode: "overlay",
        }}
      >
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
              <p className="text-gray-600 mb-6">
                {formStatus === "closed"
                  ? "แบบฟอร์มนี้ไม่รับคำตอบแล้ว"
                  : formStatus === "not_started"
                  ? "แบบฟอร์มนี้ยังไม่เปิดให้ทำ"
                  : formStatus === "already_answered"
                  ? "คุณได้ตอบแบบฟอร์มนี้ไปแล้ว"              
                  : coverPage.description}
              </p>
              {formStatus === "open" && (
                <button
                  onClick={handleStartQuiz}
                  className="px-6 py-2 text-white rounded-full hover:opacity-90 transition"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {coverPage.textButton}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
