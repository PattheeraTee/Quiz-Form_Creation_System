"use client";
import { useEffect, useState } from "react";
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
  const [selectedType, setSelectedType] = useState("แบบทดสอบ"); // Default to 'แบบสำรวจ' (survey)

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
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/getCookie`,
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
        cover_page: {
          title: quizTitle,
        },
        sections: [
          {
            number: 1, // หน้าที่ 1
            title: "แบบทดสอบ", // ตั้งชื่อ Section
            description: "คำถามทั้งหมดจากไฟล์ที่อัปโหลด", // คำอธิบาย
            questions: quiz.map((question) => {
              const isTextInput = question.options.length === 0;
              return {
                type: isTextInput ? "text_input" : "multiple_choice",
                question: question.text,
                points: question.points || 1,
                options: question.options.map((option) => ({
                  text: option.text,
                  is_correct: option.is_correct || false,
                })),
                ...(isTextInput && question.correct_answer
                  ? { correct_answer: question.correct_answer }
                  : {}),
              };
            }),
          },
        ],
      };

      // 🔹 ส่งข้อมูลไปยัง API `/form/create` โดยใช้ Axios
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/form/create`,
        formattedQuiz,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const formId = response.data.form.form_id;

      // 🔹 แจ้งเตือนสำเร็จและเปลี่ยนหน้าไปยังแบบทดสอบที่สร้าง
      Swal.fire({
        icon: "success",
        title: "สร้างแบบทดสอบสำเร็จ!",
        text: "แบบทดสอบของคุณถูกสร้างเรียบร้อยแล้ว.",
        confirmButtonText: "ตกลง",
      }).then(() => {
        window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/createquiz?type=${formType}&form_id=${formId}`;
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
  const createQuizFromTxt = (textContent) => {
    const lines = textContent.split("\n");
    const questions = [];
    let currentQuestion = null;
    let currentChoices = [];
    let currentImageUrl = null;
    let questionIndex = 0;
    let correctAnswer = null;

    lines.forEach((line) => {
      const trimmedText = line.trim();
      if (trimmedText) {
        // ตรวจสอบว่าเป็นคำตอบที่ถูกต้องหรือไม่
        if (
          trimmedText.toLowerCase().startsWith("answer") ||
          trimmedText.startsWith("เฉลย")
        ) {
          correctAnswer = trimmedText.replace(/^(answer|เฉลย)/i, "").trim();
        }
        // ตรวจสอบว่าบรรทัดนี้เป็นคำถามใหม่หรือไม่
        else if (isNewQuestion(trimmedText)) {
          if (currentQuestion) {
            // บันทึกคำถามก่อนหน้า
            saveQuestion(
              questions,
              currentQuestion,
              currentChoices,
              currentImageUrl,
              questionIndex,
              correctAnswer
            );
            questionIndex++;
          }
          // เริ่มคำถามใหม่
          currentQuestion = trimmedText;
          currentChoices = [];
          currentImageUrl = null;
          correctAnswer = null;
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
        questionIndex,
        correctAnswer
      );
    }

    setQuiz(questions); // อัปเดตสถานะของ quiz
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
    let correctAnswer = null;

    paragraphs.forEach((element) => {
      if (element.tagName === "P") {
        const trimmedText = element.innerText.trim();
        if (trimmedText) {
          // ตรวจสอบว่าเป็นคำตอบที่ถูกต้องหรือไม่
          if (
            trimmedText.toLowerCase().startsWith("answer") ||
            trimmedText.startsWith("เฉลย")
          ) {
            correctAnswer = trimmedText.replace(/^(answer|เฉลย)/i, "").trim();
          }
          // ตรวจสอบว่าเป็นคำถามใหม่
          else if (isNewQuestion(trimmedText)) {
            if (currentQuestion) {
              saveQuestion(
                questions,
                currentQuestion,
                currentChoices,
                currentImageUrl,
                questionIndex,
                correctAnswer
              );
              questionIndex++;
            }
            // เริ่มคำถามใหม่
            currentQuestion = trimmedText;
            currentChoices = [];
            currentImageUrl = null;
            correctAnswer = null;
          }
          // ตรวจสอบว่าเป็นตัวเลือก
          else if (isChoice(trimmedText)) {
            currentChoices.push({ text: trimmedText, option_image_url: null });
          }
        }
      } else if (element.tagName === "IMG") {
        if (currentQuestion && currentChoices.length === 0) {
          currentImageUrl = element.src;
        } else if (currentChoices.length > 0 && currentChoices.length <= 4) {
          currentChoices[currentChoices.length - 1].option_image_url =
            element.src;
        }
      }
    });

    if (currentQuestion) {
      saveQuestion(
        questions,
        currentQuestion,
        currentChoices,
        currentImageUrl,
        questionIndex,
        correctAnswer
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
    questionIndex,
    correctAnswer
  ) => {
    if (currentChoices.length === 0) {
      // ไม่มีตัวเลือก → เป็น Text Input
      const answerArray = correctAnswer
        ? correctAnswer.split(",").map((ans) => ans.trim())
        : [];

      questions.push({
        id: questionIndex + 1,
        quiz_id: uuidv4(),
        text: currentQuestion,
        type: "text",
        correct_answer: answerArray, // เก็บเป็น array (รองรับหลายคำตอบ)
        options: [],
        imageUrl: currentImageUrl,
      });
    } else {
      // ตรวจสอบว่าช้อยส์ไหนคือคำตอบที่ถูกต้อง
      const hasCorrectAnswer = Boolean(correctAnswer?.trim());
      // อัปเดตช้อยส์ โดยกำหนด is_correct = false ถ้าไม่มีเฉลย
      const updatedChoices = currentChoices.map((choice) => {
        const choiceText = choice.text.trim().toLowerCase();
        const correctText = correctAnswer
          ? correctAnswer.trim().toLowerCase()
          : "";

        const isCorrect =
          hasCorrectAnswer &&
          (choiceText.startsWith(correctText) || choiceText === correctText);

        return {
          text: choice.text,
          is_correct: isCorrect,
          option_image_url: choice.option_image_url || null,
        };
      });
      // Choices are present, so display radio buttons
      questions.push({
        id: questionIndex + 1,
        quiz_id: uuidv4(),
        text: currentQuestion,
        type: "radio",
        answer: "",
        options: updatedChoices,
        imageUrl: currentImageUrl, // Assign image to the question
      });
    }
  };

  const handleShowGuide = () => {
    Swal.fire({
      title: "คำแนะนำการนำเข้า",
      width: "800px",
      html: `
        <div class="text-left text-gray-800">
          <div class="px-4 py-2 rounded-lg mb-2">
            <h3 class="text-xl font-semibold mb-3 t">รูปแบบที่รองรับ (Supported Formats)</h3>
            <p class="text-gray-700 mb-3">
              ระบบรองรับการนำเข้าข้อสอบทั้งในรูปแบบไฟล์ <span class="px-2 py-1 rounded font-mono text-sm">.docx</span>
              <span class="px-2 py-1 rounded font-mono text-sm">.doc</span> และ 
              <span class="px-2 py-1 rounded font-mono text-sm">.txt</span>
              โดยสามารถสร้างคำถาม 2 ประเภท:
            </p>
            <ul class="list-disc pl-5 space-y-1 text-gray-700">
  <li>คำถามแบบเลือกตอบ (Multiple Choice)</li>
  <li>คำถามแบบเติมคำตอบ (Text Input)</li>
</ul>
          </div>
          
          <div class="tabs-container">
            <div class="tabs-header">
              <button id="tab-th" class="tab-btn active" onclick="switchTab('th')">
                ตัวอย่างภาษาไทย
              </button>
              <button id="tab-en" class="tab-btn" onclick="switchTab('en')">
                ตัวอย่างภาษาอังกฤษ
              </button>
            </div>
            
            <div id="content-th" class="tab-content active">
              <h4 class="font-medium mb-1 flex items-center">
                ตัวอย่างรูปแบบภาษาไทย
              </h4>
              <div class="px-4 py-1">
                <p class="mb-1 text-gray-800">ดาวที่อยู่ใกล้โลกที่สุดคือดาวอะไร?</p>
                <p class="text-green-600 font-medium flex items-center">
                  เฉลย ดาวพุธ
                </p>
              </div>
              <div class="px-4 py-1">
                <p class="mb-1 text-gray-800">ข้อใดไม่ใช่ดาวเคราะห์ในระบบสุริยะ?</p>
                <div class="space-y-1 pl-4">
                  <p class="py-1 px-2">ก. โลก</p>
                  <p class="py-1 px-2">ข. ดาวพลูโต</p>
                  <p class="py-1 px-2">ค. ดาวพฤหัส</p>
                  <p class="py-1 px-2">ง. ดาวอังคาร</p>
                </div>
                <p class="text-green-600 font-medium flex items-center">
                  เฉลย ข
                </p>
              </div>
            </div>
            
            <div id="content-en" class="tab-content hidden">
             <h4 class="font-medium mb-1 flex items-center">
                ตัวอย่างรูปแบบภาษาอังกฤษ
              </h4>
              <div class="px-4 py-1">
                <p class="mb-1 text-gray-800">What is the closest planet to Earth?</p>
                <p class="text-green-600 font-medium flex items-center">
                  Answer Mercury
                </p>
              </div>
              <div class="px-4 py-1">
                <p class="mb-1 text-gray-800">Which of the following is NOT a planet in our solar system?</p>
                <div class="space-y-1 pl-4">
    <p class="py-1 px-2 ">a. Earth</p>
                  <p class="py-1 px-2 ">b. Pluto</p>
                  <p class="py-1 px-2">c. Jupiter</p>
                  <p class="py-1 px-2 ">d. Mars</p>
                </div>
                <p class="text-green-600 font-medium flex items-center">
                  Answer b
                </p>
              </div>
              </div>
            </div>
          </div>
          
          <div class="mt-2 px-4 py-1 rounded-lg">
            <h4 class="font-medium mb-2 flex items-center">
              หมายเหตุสำคัญ:
            </h4>
            <ul class="space-y-1 pl-6 text-gray-700 list-disc text-left">
              <li class="">
                <span>หากไม่มีตัวเลือก <span class="px-1.5 py-0.5 rounded text-sm">ก. ข. ค. ง.</span> หรือ 
                <span class="px-1.5 py-0.5 text-sm">a. b. c. d.</span> ระบบจะจัดให้เป็น คำถามแบบเติมคำตอบ (Text Input)</span>
              </li>
              <li class="">
                <span>หากไม่ระบุเฉลย ระบบจะบันทึกคำถามโดยไม่มีคำตอบที่ถูกต้อง</span>
              </li>
            </ul>
            
          </div>
        </div>
        
        <style>
          .tabs-container {
            width: 100%;
          }
          .tabs-header {
            display: flex;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 0;
          }
          .tab-btn {
            padding: 0.75rem 1.25rem;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-bottom: none;
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
            margin-right: 0.25rem;
            cursor: pointer;
            font-weight: 500;
            color: #64748b;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
          }
          .tab-btn:hover {
            background-color: #f1f5f9;
            color: #334155;
          }
          .tab-btn.active {
            background-color: #fff;
            border-bottom: 1px solid #fff;
            margin-bottom: -1px;
            color: #3b82f6;
            box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);
          }
          .tab-content {
            display: none;
            padding: 0.5rem 1.25rem 0.5rem 1.25rem;
            background-color: #fff;
            border: 1px solid #e2e8f0;
            border-top: none;
            border-radius: 0 0 0.5rem 0.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          }
          .tab-content.active {
            display: block;
          }
          .tab-content.hidden {
            display: none;
          }
        </style>
      `,
      confirmButtonText: "ปิด",
      confirmButtonColor: "#3b82f6",
      customClass: {
        title: 'text-3xl text-gray-900',
        confirmButton: 'px-6 py-2.5 rounded-lg font-medium transition-colors'
      },
      didOpen: () => {
        window.switchTab = (tab) => {
          document.getElementById("content-th").classList.remove("active");
          document.getElementById("content-en").classList.remove("active");
          document.getElementById("tab-th").classList.remove("active");
          document.getElementById("tab-en").classList.remove("active");
          
          document.getElementById(`content-${tab}`).classList.add("active");
          document.getElementById(`tab-${tab}`).classList.add("active");
          
          document.getElementById("content-th").classList.add("hidden");
          document.getElementById("content-en").classList.add("hidden");
          document.getElementById(`content-${tab}`).classList.remove("hidden");
        };
      }
    });
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
          เลือกไฟล์ที่ต้องการนำเข้า รองรับเฉพาะไฟล์ <strong>.docx</strong> และ{" "}
          <strong>.txt</strong>
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

        <div className="flex justify-between items-center mt-6">
  <button
    onClick={handleSubmit}
    className="bg-[#03A9F4] text-white py-2 px-6 text-lg rounded-full hover:bg-[#0B76BC] transition-colors shadow-md mx-auto"
  >
    สร้าง{selectedType}
  </button>

  <button
    onClick={handleShowGuide}
    className="text-gray-700  underline font-bold cursor-pointer"
  >
    ดูคำแนะนำการนำเข้า
  </button>
</div>

        

      </div>
    </div>
  );
}
