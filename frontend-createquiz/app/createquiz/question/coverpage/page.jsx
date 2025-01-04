import React, { useContext, useState, useEffect } from "react";
import { QuizContext } from "../../QuizContext"; // Import QuizContext
import Background from "../../../components/images/Background.svg";
import Image from "next/image";
import axios from "axios";

export default function CoverPage({ coverPageData, theme }) {
  const { quizTitle, setQuizTitle, primaryColor } = useContext(QuizContext); // Access quizTitle, setQuizTitle, and primaryColor from Context
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [isEditingButtonText, setIsEditingButtonText] = useState(false); // State to toggle editing button text

  // Update state when coverPageData changes
  useEffect(() => {
    if (coverPageData) {
      setDescription(coverPageData.description || "");
      setButtonText(coverPageData.text_button || "");
    }
  }, [coverPageData]);

  const handleAutosave = async (field, value) => {
    const coverpageId = coverPageData?.cover_page_id; // Replace with actual coverPageId if different
    if (!coverpageId) {
      console.error("CoverPage ID is not available");
      return;
    }

    const data = { [field]: value }; // Dynamically create payload based on the field

    try {
      const response = await axios.patch(
        `http://localhost:3001/form/coverpage/${coverpageId}`,
        data
      );
    } catch (error) {
      console.error("Autosave failed:", error);
    }
  };

  return (
    <div className="cover-page max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-4 text-black">หน้าปก</h2>
      <div className="flex flex-col items-center mb-6">
        <div
          className="w-full h-72 object-cover mb-4 rounded-xl"
          style={{ backgroundColor: primaryColor }}
        >
          <Image
            src={Background}
            alt="Background"
            className="w-full h-72 object-cover mb-4 rounded-xl"
          />
        </div>
        <div className="flex items-center w-full mb-2">
          <input
            type="text"
            placeholder="ชื่อแบบสอบถาม"
            className="w-full px-4 py-2 border border-gray-300 rounded text-black"
            value={quizTitle}
            onChange={(e) => {
              setQuizTitle(e.target.value); // Update Context
              handleAutosave("title", e.target.value); // Autosave title
            }}
          />
        </div>
        <input
          type="text"
          placeholder="อธิบายแบบสอบถาม"
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded text-black"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            handleAutosave("description", e.target.value); // Autosave description
          }}
        />
        <div className="flex items-center">
          {!isEditingButtonText ? (
            <button
              className="px-6 py-2 bg-[#03A9F4] text-white rounded-full"
              onClick={() => setIsEditingButtonText(true)}
            >
              {buttonText || "คลิกเพื่อแก้ไข"}
            </button>
          ) : (
            <input
              type="text"
              className="px-4 py-2 border border-gray-300 rounded text-black"
              value={buttonText}
              onChange={(e) => {
                setButtonText(e.target.value);
                handleAutosave("text_button", e.target.value); // Autosave buttonText
              }}
              onBlur={() => setIsEditingButtonText(false)} // Exit editing mode when input loses focus
              autoFocus // Automatically focus on input when editing starts
            />
          )}
        </div>
      </div>
    </div>
  );
}
