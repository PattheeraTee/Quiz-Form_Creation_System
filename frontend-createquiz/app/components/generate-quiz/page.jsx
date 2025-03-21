"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function GenerateQuizForm() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(1);
  const [language, setLanguage] = useState("");
  const [languages, setLanguages] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch("http://localhost:3001/languages");
        if (response.ok) {
          const data = await response.json();
          setLanguages(data);
          setLanguage(data[0]); // ตั้งค่าเริ่มต้นเป็นตัวเลือกแรก
        } else {
          console.error("Failed to fetch languages");
        }
      } catch (error) {
        console.error("Error fetching languages:", error);
      }
    };

    fetchLanguages();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    Swal.fire({
      title: 'Generating...',
      text: 'กรุณารอสักครู่ ขณะนี้กำลังสร้างแบบทดสอบ...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // ✅ 1. ดึง `user_id` จาก Cookie
      const cookieResponse = await fetch("http://localhost:3000/api/getCookie", {
        credentials: "include",
      });

      const cookieData = await cookieResponse.json();
      const userId = cookieData?.userId || null;

      if (!userId) {
        Swal.fire({
          icon: 'error',
          title: 'ไม่พบข้อมูลผู้ใช้',
          text: 'กรุณาเข้าสู่ระบบก่อนสร้างแบบทดสอบ',
        });
        return;
      }

      // ✅ 2. ส่ง `POST` ไปยัง `/generate-quiz`
      const response = await fetch("http://localhost:3001/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId, // ✅ เปลี่ยนจาก userId -> user_id
          form_type: "quiz", // ✅ เพิ่ม form_type
          topic,
          numQuestions,
          language,
          cover_page: { // ✅ แก้ key quizTitle -> title และ text_button
            title: "Untitled Quiz",
            text_button: "เริ่มทำ",
            description: ""
          },
          theme: { // ✅ เพิ่ม theme
            primary_color: "#03A9F4"
          },
          sections: [
            {
              title: "Quiz Section",
              questions: [] // สร้างให้ Gemini เพิ่มเอง
            }
          ]
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.close();
        router.push(`/createquiz?type=quiz&form_id=${data.form_id}`); // ✅ เปลี่ยน quizId -> form_id
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed to generate quiz',
          text: data.message,
        });
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถสร้างแบบทดสอบได้ กรุณาลองอีกครั้ง',
      });
    }
};

  return (
    <div className="flex flex-col justify-start min-h-screen bg-[#F9F8F6] px-4 m-4 mt-6">
      <h1 className="text-3xl font-semibold mb-6">
      สร้างแบบทดสอบด้วย AI
      </h1>
      <div className="w-full bg-white shadow-md rounded-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          สร้างแบบทดสอบอัตโนมัติ
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="topic" className="block text-gray-700 mb-2">
              ใส่เนื้อหาหรือหัวข้อของแบบทดสอบที่คุณต้องการสร้าง
            </label>
            <textarea
              id="topic"
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows="10"
              placeholder="เช่น แมวในประเทศไทย..."
              required
            />
          </div>

          <div>
            <label htmlFor="numQuestions" className="block text-gray-700 mb-2">
              ใส่จำนวนข้อที่ต้องการให้สร้าง
            </label>
            <input
              id="numQuestions"
              type="number"
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
              min="1"
              max="10"
              placeholder="ใส่จำนวนข้อที่ต้องการให้สร้าง"
              required
            />
          </div>

          <div>
            <label htmlFor="language" className="block text-gray-700 mb-2">
              เลือกภาษาที่ต้องการสร้างแบบทดสอบ
            </label>
            <select
              id="language"
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              required
            >
              {languages.map((lang, index) => (
                <option key={index} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-[#03A9F4] text-white py-2 px-6 text-lg rounded-full hover:bg-[#0B76BC] transition-colors shadow-md mx-auto block"
          >
            สร้างแบบทดสอบ
          </button>
        </form>
      </div>
    </div>
  );
}
