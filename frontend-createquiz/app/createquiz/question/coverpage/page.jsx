import React, { useState } from "react";
import ButtonPopup from "../popup/buttonpopup/page"; // Import the buttonpopup component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";

const CoverPage = () => {
  const [showButtonPopup, setShowButtonPopup] = useState(false); // State for buttonpopup

  // const handleIconClick = () => {
  //   setShowTextPopup((prev) => !prev);
  // };

  // const handleInputClick = () => {
  //   setShowTextPopup(true);
  // };

  const handleButtonClick = () => {
    setShowButtonPopup((prev) => !prev); // Toggle buttonpopup on click
  };

  return (
    <div className="cover-page max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
      {showButtonPopup && <ButtonPopup />} {/* Show buttonpopup when state is true */}
      
      <h2 className="text-2xl font-semibold mb-4 text-black">หน้าปก</h2>

      <div className="flex flex-col items-center mb-6">
        <img
          src="https://hisopartyofficial.com/backend/web/uploads/images/202405/1/11903/ea66b12249b2592db7243e165aae4f5c.jpg"
          alt="Cover"
          className="w-full h-72 object-cover mb-4 rounded-xl"
        />
        <div className="flex items-center w-full mb-2">
          <input
            type="text"
            placeholder="ชื่อแบบสอบถาม"
            className="w-full px-4 py-2 border border-gray-300 rounded text-black"
            // onClick={handleInputClick}
          />
          <FontAwesomeIcon
            icon={faPenToSquare}
            className="ml-2 cursor-pointer text-gray-600 w-5 h-5"
            // onClick={handleIconClick}
          />
        </div>
        <input
          type="text"
          placeholder="อธิบายแบบสอบถาม"
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded text-black"
          // onClick={handleInputClick}
        />
        <button
          className="px-6 py-2 bg-[#03A9F4] text-white rounded-full"
          onClick={handleButtonClick} // Toggle buttonpopup visibility
        >
          เริ่มต้น
        </button>
      </div>
    </div>
  );
};

export default CoverPage;
