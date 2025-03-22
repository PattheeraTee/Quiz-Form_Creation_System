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
  const createQuizFromTxt = (textContent) => {
    console.log("create from text");
    const lines = textContent.split("\n");
    const questions = [];
    let currentQuestion = null;
    let currentChoices = [];
    let currentImageUrl = null;
    let questionIndex = 0;
    let correctAnswer = null;

    lines.forEach((line) => {
      const trimmedText = line.trim();
      console.log("trimmedText", trimmedText);
      if (trimmedText) {
        // ตรวจสอบว่าเป็นคำตอบที่ถูกต้องหรือไม่
        if (
          trimmedText.toLowerCase().startsWith("answer") ||
          trimmedText.startsWith("เฉลย")
        ) {
          correctAnswer = trimmedText.replace(/^(answer|เฉลย)/i, "").trim();
          console.log("✅ Correct Answer Detected:", correctAnswer);
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
            console.log("✅ Correct Answer Detected:", correctAnswer);
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
      console.log("✅ Correct Answer Array:", answerArray);

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
    // console.log("✅ Question Saved:", questions[questions.length - 1]);
  };

  useEffect(() => {
    console.log("quiz title: ", quizTitle);
    console.log("quiz: ", quiz);
  }, [quizTitle, quiz]);

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
          <br />
          <span className="text-red-600 font-bold">
            **รูปแบบที่รองรับเขียนไว้อยู่ด้านล่าง**
          </span>
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
            สร้าง{selectedType}
          </button>
        </div>

        <div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 mt-6">
            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 pb-3">
              รูปแบบที่รองรับ (Supported Formats)
            </h2>

            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                ระบบรองรับการนำเข้าข้อสอบทั้งในรูปแบบไฟล์ .docx, .doc และ .txt
                โดยสามารถสร้างคำถามสองประเภท:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                <li>คำถามแบบเลือกตอบ (Multiple Choice)</li>
                <li>คำถามแบบเติมคำตอบ (Text Input)</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* รูปแบบภาษาไทย */}
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-4 ">รูปแบบภาษาไทย</h3>

                <div className="mb-5">
                  <h4 className="font-medium mb-2">
                    คำถามแบบเติมคำตอบ (Text Input)
                  </h4>
                  <div className="mb-2 bg-white p-4 border border-gray-300 rounded-md shadow-sm">
                    <p className="mb-3">ดาวที่อยู่ใกล้โลกที่สุดคือดาวอะไร?</p>
                    <p className="text-green-600 font-medium border-t pt-2">
                      เฉลย ดาวพุธ
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 italic">
                    * สามารถระบุหลายคำตอบได้โดยคั่นด้วยเครื่องหมายจุลภาค (,)
                    เช่น{" "}
                    <span className="font-medium">เฉลย ดาวพุธ, ดาวศุกร์</span>
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2 ">
                    คำถามแบบเลือกตอบ (Multiple Choice)
                  </h4>
                  <div className="bg-white p-4 border border-gray-300 rounded-md shadow-sm">
                    <p className="mb-3">ข้อใดไม่ใช่ดาวเคราะห์ในระบบสุริยะ?</p>
                    <div className="space-y-1 mb-3 pl-4">
                      <p>ก. โลก</p>
                      <p>ข. ดาวพลูโต</p>
                      <p>ค. ดาวพฤหัส</p>
                      <p>ง. ดาวอังคาร</p>
                    </div>
                    <p className="text-green-600 font-medium border-t pt-2">
                      เฉลย ข
                    </p>
                  </div>
                </div>
              </div>

              {/* English Format */}
              <div className="p-5 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 ">English Format</h3>

                <div className="mb-5">
                  <h4 className="font-medium mb-2 ">Text Input Questions</h4>
                  <div className="mb-2 bg-white p-4 border border-gray-300 rounded-md shadow-sm">
                    <p className="mb-3">What is the closest planet to Earth?</p>
                    <p className="text-green-600 font-medium border-t pt-2">
                      Answer Mercury
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 italic">
                    * Multiple answers can be specified using commas, e.g.,{" "}
                    <span className="font-medium">Answer Mercury, Venus</span>
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">
                    Multiple Choice Questions
                  </h4>
                  <div className="bg-white p-4 border border-gray-300 rounded-md shadow-sm">
                    <p className="mb-3">
                      Which of the following is NOT a planet in our solar
                      system?
                    </p>
                    <div className="space-y-1 mb-3 pl-4">
                      <p>a. Earth</p>
                      <p>b. Pluto</p>
                      <p>c. Jupiter</p>
                      <p>d. Mars</p>
                    </div>
                    <p className="text-green-600 font-medium border-t pt-2">
                      Answer b
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* หมายเหตุ */}
            <div className="mt-8 p-5 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-yellow-800">
                หมายเหตุสำคัญ:
              </h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>
                  หากไม่มีตัวเลือก ก. ข. ค. ง. หรือ a. b. c. d.
                  คำถามจะถูกจัดให้เป็นแบบเติมคำตอบ (Text Input)
                </li>
                <li>หากไม่ระบุเฉลย ระบบจะบันทึกคำถามโดยไม่มีคำตอบที่ถูกต้อง</li>
                <li>คำถามจะถูกแยกอัตโนมัติจากไฟล์ตามรูปแบบที่กำหนด</li>
                {/* <li>รูปภาพในไฟล์ .docx จะถูกนำเข้าพร้อมกับคำถามและตัวเลือก</li> */}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
