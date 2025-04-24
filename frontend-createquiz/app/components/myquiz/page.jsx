"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import axios from "axios";
import Background from "../../components/images/backgroud-cloud-horizental.svg";
import Image from "next/image";

export default function MyQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserIdAndQuizzes = async () => {
      try {
        // Fetch user ID from the API
        const userResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/getCookie`
        );
        const userId = userResponse.data.userId;
        setUserId(userId);

        // Fetch all quizzes using the user ID
        const quizzesResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/form/user/${userId}`
        );

        // Extract quizzes from response
        const quizzesData = quizzesResponse.data.forms;
        setQuizzes(quizzesData);
      } catch (error) {
        console.error("Error fetching quizzes or user ID:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserIdAndQuizzes();
  }, []);

  const handleQuizClick = (quizId) => {
    router.push(`/quiz/${quizId}`);
  };

  const handleEditQuiz = (formType, formId) => {
    router.push(`/createquiz?type=${formType}&form_id=${formId}`);
  };

  const handleDeleteQuiz = async (quizId) => {
    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "การลบควิซนี้จะไม่สามารถกู้คืนได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบเลย!",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(
            `${process.env.API_BASE_URL}/form/${quizId}`
          );

          if (response.status === 200) {
            Swal.fire("ลบสำเร็จ!", "ควิซถูกลบแล้ว", "success");
            setQuizzes(quizzes.filter((quiz) => quiz.form_id !== quizId));
          } else {
            Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบควิซได้", "error");
          }
        } catch (error) {
          console.error("Error deleting quiz:", error);
          Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบควิซได้", "error");
        }
      }
    });
  };
  return (
    <div className="px-4 m-4 mt-6 bg-[#F9F8F6]">
      <h1 className="text-3xl font-semibold mb-6">ควิซของฉัน</h1>

      {loading && (
        <div className="text-center text-lg font-semibold mt-10">
          Loading...
        </div>
      )}

      {!loading && quizzes.length === 0 && (
        <div className="text-center text-lg font-semibold mt-10 text-gray-600">
          ไม่พบควิซของคุณ
        </div>
      )}

      {!loading && quizzes.length > 0 && (
        <div className="space-y-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.form_id}
              className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div
                className="flex space-x-8"
                onClick={() => handleEditQuiz(quiz.form_type, quiz.form_id)}
                >
                <div
                  className="w-60 h-40 object-cover rounded-xl bg-red-200 relative"
                  style={{ backgroundColor: quiz.theme?.primary_color }}
                >
                  <Image
                    src={Background}
                    alt="Background"
                    className="absolute bottom-0 left-0 w-full h-auto rounded-xl"
                  />
                </div>

                <h2 className="text-lg font-medium text-blue-500 mt-6">
                  {quiz.coverpage?.title || "Untitled Quiz"}
                </h2>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  className="text-gray-500 hover:text-black"
                  onClick={() => handleEditQuiz(quiz.form_type, quiz.form_id)}
                >
                  แก้ไข
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteQuiz(quiz.form_id)}
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
