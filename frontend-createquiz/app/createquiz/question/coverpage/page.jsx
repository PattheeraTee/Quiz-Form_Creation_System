import React, { useState, useEffect } from "react";
import ButtonPopup from "../popup/buttonpopup/page"; // Import the buttonpopup component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import Background from "../../../components/images/Background.svg";
import Image from "next/image";

export default function CoverPage({ coverPageData, theme }) {
  const [showButtonPopup, setShowButtonPopup] = useState(false); // State for buttonpopup
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");

  // Update state when coverPageData changes
  useEffect(() => {
    if (coverPageData && theme) {
      setTitle(coverPageData.title || "");
      setDescription(coverPageData.description || "");
      setButtonText(coverPageData.text_button || "");
      setPrimaryColor(theme.primary_color || "#000000");
      console.log("Cover page data:", coverPageData);
      console.log("Theme:", theme);
    }
  }, [coverPageData, theme]);

  const handleButtonClick = () => {
    setShowButtonPopup((prev) => !prev); // Toggle buttonpopup on click
  };

  return (
    <div className="cover-page max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
      {showButtonPopup && <ButtonPopup />}{" "}
      {/* Show buttonpopup when state is true */}
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
            value={title}
            onChange={(e) => setTitle(e.target.value)} // Update state correctly
          />
          <FontAwesomeIcon
            icon={faPenToSquare}
            className="ml-2 cursor-pointer text-gray-600 w-5 h-5"
          />
        </div>
        <input
          type="text"
          placeholder="อธิบายแบบสอบถาม"
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded text-black"
          value={description}
          onChange={(e) => setDescription(e.target.value)} // Update state correctly
        />
        <button
          className="px-6 py-2 bg-[#03A9F4] text-white rounded-full"
          onClick={handleButtonClick} // Toggle buttonpopup visibility
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
