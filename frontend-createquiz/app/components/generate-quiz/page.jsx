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

    // แสดง SweetAlert ขณะที่กำลังประมวลผล
    Swal.fire({
      title: 'Generating...',
      text: 'กรุณารอสักครู่ ขณะนี้กำลังสร้างแบบทดสอบ...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const response = await fetch("http://localhost:3001/generate-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        numQuestions,
        language,
        userId: "admin",
        type: "quiz",
        coverPage: {
          quizTitle: `Untitled Quiz`,
          description: ``,
          buttonText: "Start",
        },
        sectionId: "section 1", // Example static sectionId for now
        sectionTitle: "",
        sectionDescription: "",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // เมื่อประมวลผลสำเร็จ ให้ปิด SweetAlert และนำทางไปหน้าแบบทดสอบที่สร้างแล้ว
      Swal.close();
      router.push(`/quiz/${data.quizId}`);
    } else {
      // กรณีมีข้อผิดพลาดแสดงข้อความแจ้ง
      Swal.fire({
        icon: 'error',
        title: 'Failed to generate quiz',
        text: data.message,
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
