"use client";
import { useState } from "react";
import mammoth from "mammoth";
import JSZip from "jszip";
import { v4 as uuidv4 } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import axios from "axios";

export default function QuizUploadPage() {
  const [quiz, setQuiz] = useState([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [selectedType, setSelectedType] = useState(""); // Default to 'แบบสำรวจ' (survey)

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert("Please select a file.");
      return;
    }

    setUploadedFileName(file.name); // Update the uploaded file name for display
    const fileTitle = file.name.split(".")[0];
    setQuizTitle(fileTitle);

    const fileType = file.name.split(".").pop().toLowerCase();
    if (fileType === "txt") {
      handleTxtFile(file);
    } else if (fileType === "doc" || fileType === "docx") {
      handleDocFile(file);
    } else {
      alert("Supported formats are .txt, .doc, and .docx only.");
    }
  };

  const handleTxtFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      createQuizFromTxt(e.target.result); // ส่งผลลัพธ์ไปยังฟังก์ชันสร้าง quiz
    };
    reader.readAsText(file);
  };

  const handleDocFile = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const zip = await JSZip.loadAsync(arrayBuffer); // Load the docx file as a zip
        const text = await extractTextFromDocx(arrayBuffer);
        const images = await extractImagesFromDocx(zip);
        createQuizFromHtml(text, images);
      } catch (err) {
        setErrorMessage("Error reading the DOC/DOCX file.");
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Extract text and images (functions unchanged)...
  // Similar logic for handling quiz creation and rendering...
  const extractTextFromDocx = async (arrayBuffer) => {
    const result = await mammoth.convertToHtml({
      arrayBuffer: arrayBuffer,
      convertImage: mammoth.images.inline((element) => {
        return element.read("base64").then((imageBuffer) => {
          return {
            src: `data:${element.contentType};base64,${imageBuffer}`,
          };
        });
      }),
    });
    return result.value;
  };

  const extractImagesFromDocx = async (zip) => {
    const images = {};
    const mediaFolder = zip.folder("word/media");
    if (mediaFolder) {
      const files = mediaFolder.file(/.+/);
      for (const file of files) {
        const blob = await file.async("blob");
        const imageUrl = URL.createObjectURL(blob);
        images[file.name] = imageUrl; // Store images with their names as keys
      }
    }
    return images;
  };

  const displayQuestion = () => {
    return quiz.map((q, index) => (
      <div key={index} className="bg-white p-4 my-4 shadow-lg rounded-lg">
        <p className="font-semibold text-lg mb-2 text-black">{q.text}</p>

        {/* Display question image */}
        {q.imageUrl && (
          <img
            src={q.imageUrl}
            alt={`Question Image ${index}`}
            className="w-full h-auto mb-4"
          />
        )}

        {/* If the question has no options, display a text input */}
        {q.options.length === 0 ? (
          <div className="mb-2 text-black">
            <input
              type="text"
              id={`question${index}`}
              value={q.answer}
              placeholder=""
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        ) : (
          /* Display radio buttons if options are available */
          q.options.map((choice, i) => (
            <div key={i} className="flex flex-col mb-2 text-black">
              <div className="flex items-center">
                <input
                  type="radio"
                  name={`question${index}`}
                  value={choice.text}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className="mr-2"
                />
                <label>{choice.text}</label>
              </div>

              {/* Display option image if available */}
              {choice.option_image_url && (
                <img
                  src={choice.option_image_url}
                  alt={`Option Image ${i}`}
                  className="w-4/5 h-auto mt-2"
                />
              )}
            </div>
          ))
        )}
      </div>
    ));
  };

  const handleAnswerChange = (questionIndex, value) => {
    const updatedQuiz = [...quiz];
    updatedQuiz[questionIndex].answer = value;
    setQuiz(updatedQuiz);
  };

  const handleCoverImageUpload = (event) => {
    const file = event.target.files[0];
    setCoverImageFile(file); // Store the selected cover image file
  };

  const handleSubmit = async () => {
    // ตรวจสอบว่าอัปโหลดไฟล์หรือยัง
    if (!uploadedFileName) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาอัพโหลดไฟล์",
        text: "คุณต้องอัพโหลดไฟล์ก่อนที่จะดำเนินการสร้างแบบทดสอบ",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    try {
      // 🔹 ดึง user_id จาก cookie API โดยใช้ Axios
      const userResponse = await axios.get(
        "http://localhost:3000/api/getCookie",
        {
          withCredentials: true, // สำคัญเพื่อให้ Axios ดึงค่า cookie ได้
        }
      );

      const userId = userResponse.data.userId;

      if (!userId) {
        throw new Error("User ID not found in cookies");
      }

      const formType = selectedType === "แบบสำรวจ" ? "survey" : "quiz";
      // 🔹 แปลงข้อมูล Quiz ให้อยู่ในรูปแบบ JSON ที่ต้องการ
      const formattedQuiz = {
        user_id: userId,
        form_type: formType,
        sections: [
          {
            number: 1, // หน้าที่ 1
            title: "แบบทดสอบ", // ตั้งชื่อ Section
            description: "คำถามทั้งหมดจากไฟล์ที่อัปโหลด", // คำอธิบาย
            questions: quiz.map((question) => ({
              type:
                question.options.length > 0 ? "multiple_choice" : "text_input",
              question: question.text,
              // required: true,
              points: question.points || 1,
              options: question.options.map((option) => ({
                text: option.text,
                is_correct: false,
              })),
              ...(question.type === "text_input"
                ? { correct_answer: [""] }
                : {}),
            })),
          },
        ],
      };

      console.log(
        "📌 JSON ที่จะส่งไป API:",
        JSON.stringify(formattedQuiz, null, 2)
      );

      // 🔹 ส่งข้อมูลไปยัง API `/form/create` โดยใช้ Axios
      const response = await axios.post(
        "http://localhost:3001/form/create",
        formattedQuiz,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // console.log("🔹 สร้างแบบทดสอบ:", formattedQuiz);
      const formId = response.data.form.form_id;
      console.log("✅ Quiz created successfully:", response.data);
      console.log("Form ID:", response.data.form.form_id);

      // 🔹 แจ้งเตือนสำเร็จและเปลี่ยนหน้าไปยังแบบทดสอบที่สร้าง
      Swal.fire({
        icon: "success",
        title: "สร้างแบบทดสอบสำเร็จ!",
        text: "แบบทดสอบของคุณถูกสร้างเรียบร้อยแล้ว.",
        confirmButtonText: "ตกลง",
      }).then(() => {
        window.location.href = `http://localhost:3000/createquiz?type=${formType}&form_id=${formId}`;
      });
    } catch (error) {
      console.error("❌ Error creating quiz:", error);

      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถสร้างแบบทดสอบได้ กรุณาลองอีกครั้ง.",
        confirmButtonText: "ตกลง",
      });
    }
  };

  const createQuizFromHtml = (html, images) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const paragraphs = Array.from(tempDiv.querySelectorAll("p, img")); // Extract <p> and <img> elements

    const questions = [];
    let currentQuestion = null;
    let currentChoices = [];
    let currentImageUrl = null;
    let questionIndex = 0;

    paragraphs.forEach((element) => {
      if (element.tagName === "P") {
        const trimmedText = element.innerText.trim();
        if (trimmedText) {
          // Check if it's a new question
          if (isNewQuestion(trimmedText)) {
            if (currentQuestion) {
              // Save previous question
              // console.log(`Question: ${currentQuestion}`);
              // console.log(`Choices:`, currentChoices.map(c => c.text));
              saveQuestion(
                questions,
                currentQuestion,
                currentChoices,
                currentImageUrl,
                questionIndex
              );
              questionIndex++;
            }
            // Start new question
            currentQuestion = trimmedText;
            currentChoices = [];
            currentImageUrl = null;
          }
          // Otherwise, treat it as a choice
          else if (isChoice(trimmedText)) {
            currentChoices.push({ text: trimmedText, option_image_url: null }); // This is a choice
          }
        }
      } else if (element.tagName === "IMG") {
        if (currentQuestion && currentChoices.length === 0) {
          currentImageUrl = element.src; // Image belongs to the question
        } else if (currentChoices.length > 0 && currentChoices.length <= 4) {
          currentChoices[currentChoices.length - 1].option_image_url =
            element.src; // Image belongs to the last choice
        }
      }
    });

    // Save the last question
    if (currentQuestion) {
      saveQuestion(
        questions,
        currentQuestion,
        currentChoices,
        currentImageUrl,
        questionIndex
      );
    }

    setQuiz(questions);
  };

  // Helper function to determine if a paragraph is a new question
  const isNewQuestion = (text) => {
    // Check if the text starts with a number, or doesn't start with a choice prefix (abcd, กขคง)
    return /^\d+\.?\s+/.test(text) || !/^[abcdกขคง]\.?\s+/.test(text);
  };

  // Helper function to determine if a paragraph is a choice
  const isChoice = (text) => {
    // Check if the text starts with a valid choice prefix (abcd, กขคง)
    return /^[abcdกขคง]\.?\s+/.test(text);
  };

  // Helper function to save the question
  const saveQuestion = (
    questions,
    currentQuestion,
    currentChoices,
    currentImageUrl,
    questionIndex
  ) => {
    if (currentChoices.length === 0) {
      // No choices, so display a text input
      questions.push({
        id: questionIndex + 1,
        quiz_id: uuidv4(),
        text: currentQuestion,
        type: "text",
        answer: "",
        options: [],
        imageUrl: currentImageUrl, // Assign image to the question
      });
    } else {
      // Choices are present, so display radio buttons
      questions.push({
        id: questionIndex + 1,
        quiz_id: uuidv4(),
        text: currentQuestion,
        type: "radio",
        answer: "",
        options: [...currentChoices],
        imageUrl: currentImageUrl, // Assign image to the question
      });
    }
  };

  const createQuizFromTxt = (textContent) => {
    const lines = textContent.split("\n");
    const questions = [];
    let currentQuestion = null;
    let currentChoices = [];
    let currentImageUrl = null;
    let questionIndex = 0;

    lines.forEach((line) => {
      const trimmedText = line.trim();
      if (trimmedText) {
        // ตรวจสอบว่าบรรทัดนี้เป็นคำถามใหม่หรือไม่
        if (isNewQuestion(trimmedText)) {
          if (currentQuestion) {
            // บันทึกคำถามก่อนหน้า
            saveQuestion(
              questions,
              currentQuestion,
              currentChoices,
              currentImageUrl,
              questionIndex
            );
            questionIndex++;
          }
          // เริ่มคำถามใหม่
          currentQuestion = trimmedText;
          currentChoices = [];
          currentImageUrl = null;
        }
        // ตรวจสอบว่าบรรทัดนี้เป็นตัวเลือกหรือไม่
        else if (isChoice(trimmedText)) {
          currentChoices.push({ text: trimmedText, option_image_url: null });
        }
      }
    });

    // บันทึกคำถามสุดท้าย
    if (currentQuestion) {
      saveQuestion(
        questions,
        currentQuestion,
        currentChoices,
        currentImageUrl,
        questionIndex
      );
    }

    setQuiz(questions); // อัปเดตสถานะของ quiz
  };

  return (
    <div className="px-4 m-4 mt-6">
      <h1 className="text-3xl font-semibold mb-6">
        สร้างแบบทดสอบด้วยการนำเข้าเอกสาร
      </h1>

      <div className="w-full bg-white shadow-md rounded-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold text-center mb-4">
          นำเข้าเอกสาร
        </h2>
        <p className="text-gray-700 mb-6">
          เลือกไฟล์ที่ต้องการนำเข้า รองรับเฉพาะไฟล์ .docx และ .txt
        </p>

        <label htmlFor="file-upload" className="cursor-pointer">
          <div
            className={`border border-gray-300 rounded-lg p-4 flex justify-between items-center mb-6 hover:bg-gray-100 ${
              uploadedFileName ? "border-green-500" : ""
            }`}
          >
            <div className="flex items-center space-x-4">
              {uploadedFileName ? (
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className="text-green-500 text-4xl"
                />
              ) : (
                <>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-md flex items-center justify-center">
                      DOC
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-red-600 text-white rounded-md flex items-center justify-center">
                      TXT
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex-1 ml-4">
              {uploadedFileName ? (
                <>
                  <p className="block text-gray-700 font-medium mb-2">
                    {uploadedFileName} อัพโหลดสำเร็จ
                  </p>
                </>
              ) : (
                <>
                  <p className="block text-gray-700 font-medium mb-2">
                    อัพโหลดไฟล์จากเครื่อง
                  </p>
                  <p className="text-sm text-gray-500">
                    เลือกไฟล์ที่ต้องการนำเข้า รองรับเฉพาะไฟล์ .docx และ .txt
                  </p>
                </>
              )}
            </div>
          </div>
        </label>

        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".docx, .txt"
          onChange={handleFileUpload}
        />

        <p className="text-gray-500 mb-4">เลือกประเภทแบบทดสอบที่ต้องการสร้าง</p>
        <div className="flex space-x-4 mb-6">
          <button
            className={`border border-gray-300 rounded-lg py-2 px-4 flex items-center space-x-2 ${
              selectedType === "แบบทดสอบ"
                ? "bg-[#03A9F4] text-white"
                : "bg-white"
            }`}
            onClick={() => setSelectedType("แบบทดสอบ")}
          >
            <span className="text-xl">?</span>
            <span>สร้างแบบทดสอบ</span>
          </button>
          <button
            className={`border border-gray-300 rounded-lg py-2 px-4 flex items-center space-x-2 ${
              selectedType === "แบบสำรวจ"
                ? "bg-[#03A9F4] text-white"
                : "bg-white"
            }`}
            onClick={() => setSelectedType("แบบสำรวจ")}
          >
            <span className="text-xl">📋</span>
            <span>สร้างแบบสำรวจ</span>
          </button>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={handleSubmit}
            className="bg-[#03A9F4] text-white py-2 px-6 text-lg rounded-full hover:bg-[#0B76BC] transition-colors shadow-md mx-auto block"
          >
            สร้างแบบทดสอบ
          </button>
        </div>
      </div>
    </div>
  );
}
