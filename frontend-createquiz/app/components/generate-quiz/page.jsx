"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { faImage } from "@fortawesome/free-solid-svg-icons";

export default function GenerateQuizForm() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(1);
  const [language, setLanguage] = useState("");
  const [languages, setLanguages] = useState([]);
  const [educationLevel, setEducationLevel] = useState("");
  const [educationLevels, setEducationLevels] = useState([]);
  const [images, setImages] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ ดึงข้อมูลภาษา
        const langResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/languages`);
        if (langResponse.ok) {
          const langData = await langResponse.json();
          setLanguages(langData);
          setLanguage(langData[0]); // ตั้งค่าภาษาเริ่มต้น
        }

        // ✅ ดึงข้อมูลระดับการศึกษา
        const eduResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/education-levels`
        );
        if (eduResponse.ok) {
          const eduData = await eduResponse.json();
          setEducationLevels(eduData);
          setEducationLevel(eduData[0]?.id || ""); // ตั้งค่าระดับการศึกษาเริ่มต้น
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (images.length + files.length > 5) {
      Swal.fire("อัปโหลดได้สูงสุด 5 รูป!", "", "warning");
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages([...images, ...newImages]);
  };

  // ✅ ฟังก์ชันลบรูปที่อัปโหลด
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    Swal.fire({
      title: "Generating...",
      text: "กรุณารอสักครู่ ขณะนี้กำลังสร้างแบบทดสอบ...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // ✅ 1. ดึง `user_id` จาก Cookie
      const cookieResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/getCookie`,
        {
          credentials: "include",
        }
      );

      const cookieData = await cookieResponse.json();
      const userId = cookieData?.userId || null;

      if (!userId) {
        Swal.fire({
          icon: "error",
          title: "ไม่พบข้อมูลผู้ใช้",
          text: "กรุณาเข้าสู่ระบบก่อนสร้างแบบทดสอบ",
        });
        return;
      }

      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("form_type", "quiz");
      formData.append("topic", topic);
      formData.append("numQuestions", numQuestions);
      formData.append("language", language);
      formData.append("education_level", educationLevel);
  
      // ✅ 3. เพิ่มรูปภาพใน `FormData`
      images.forEach((img) => formData.append("images", img.file));
  
      // ✅ 4. ส่ง `POST` ไปยัง `/generate-quiz`
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/generate-quiz`, {
        method: "POST",
        body: formData, // ✅ ใช้ FormData แทน JSON
      });

      
      const data = await response.json();

      if (response.ok) {
        Swal.close();
        router.push(`/createquiz?type=quiz&form_id=${data.form_id}`); // ✅ เปลี่ยน quizId -> form_id
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to generate quiz",
          text: data.message,
        });
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถสร้างแบบทดสอบได้ กรุณาลองอีกครั้ง",
      });
    }
  };

  return (
    <div className="flex flex-col justify-start min-h-screen bg-[#F9F8F6] px-4 m-4 mt-6">
      <h1 className="text-3xl font-semibold mb-6">สร้างแบบทดสอบด้วย AI</h1>
      <div className="w-full bg-white shadow-md rounded-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          สร้างแบบทดสอบอัตโนมัติ
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="topic" className="block text-gray-700 mb-2">
              ใส่เนื้อหาหรือหัวข้อของแบบทดสอบที่คุณต้องการสร้าง
            </label>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.preview}
                      alt="uploaded"
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="relative w-full">
              <textarea
                id="topic"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows="10"
                placeholder="เช่น แมวในประเทศไทย..."
                required
              />
              <button
                type="button"
                className="absolute top-2 right-2 p-2 text-gray-700"
                onClick={() => document.getElementById("imageUpload").click()}
              >
                <FontAwesomeIcon icon={faImage} className="w-6 h-6" />
              </button>

              <input
                type="file"
                id="imageUpload"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
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

          <div>
            <label
              htmlFor="educationLevel"
              className="block text-gray-700 mb-2"
            >
              เลือกระดับการศึกษา
            </label>
            <select
              id="educationLevel"
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500"
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              required
            >
              {educationLevels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
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
