// components/Section.js
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faCalendarAlt,
  faTrash,
  faGripVertical,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

const Section = ({
  section,
  questionTypes,
  addQuestion,
  updateOption,
  updateRatingLevel,
  addOption,
  removeOption,
  toggleRequired,
  deleteQuestion,
  deleteSection,
  toggleQuestionTypesVisibility,
  addSection,
  handleUploadImage,
}) => {
  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white p-6 rounded-xl shadow relative">
      <h3 className="text-xl font-semibold mb-2 text-black">
        ส่วนที่ {section.id}
      </h3>
      <input
        type="text"
        placeholder={`ชื่อส่วนที่ ${section.id}`}
        className="w-full px-4 py-2 mb-2 border border-gray-300 rounded text-black"
      />
      <textarea
        placeholder="คำอธิบาย"
        className="w-full px-4 py-2 mb-4 border border-gray-300 rounded text-black"
      />

      {/* Display question types */}
      {section.questions.length === 0 ? (
        <div className="mb-4">
          <button
            onClick={() => toggleQuestionTypesVisibility(section.id)}
            className="text-[#03A9F4] font-bold mb-2"
          >
            + เพิ่มคำถามใหม่
          </button>
          {section.showQuestionTypes && (
            <div className="grid grid-cols-3 gap-2">
              {questionTypes.map((qType) => (
                <button
                  key={qType.value}
                  onClick={() => addQuestion(section.id, qType.value)}
                  className="flex items-center px-4 py-2 bg-gray-200 rounded-full"
                >
                  <span className="mr-2">{qType.icon}</span>
                  <span className="text-black">{qType.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* List of questions */}
      {section.questions.map((question) => (
        <div
          key={question.id}
          className="mt-4 p-4 border border-gray-300 rounded bg-white"
        >
          <div className="flex flex-col mb-4">
            <div className="flex items-center mb-2">
              {/* Question Input */}
              <input
                type="text"
                placeholder="คำถาม"
                className="w-full px-4 py-2 border border-gray-300 rounded text-black"
              />
              {/* Upload Image Button */}
              <button
                className="ml-4 text-gray-500"
                onClick={() =>
                  document
                    .getElementById(`question-file-upload-${question.id}`)
                    .click()
                }
              >
                <FontAwesomeIcon
                  icon={faImage}
                  className="w-6 h-6 text-gray-500"
                />
              </button>
              {/* Hidden File Input */}
              <input
                type="file"
                id={`question-file-upload-${question.id}`}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleUploadImage(e, section.id, question.id)}
              />
            </div>

            {/* Show Uploaded Image */}
            {question.image && (
              <div className="mt-2 flex justify-center">
                <img
                  src={question.image}
                  alt={`คำถาม`}
                  className="w-4/5 max-h-80 object-contain border border-gray-300 rounded"
                />
              </div>
            )}
          </div>

          {/* If text_input, show a simple text area */}
          {question.type === "text_input" && (
            <div>
              {/* Correct Answers Section */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="กรอกคำตอบของคุณ"
                  className="w-full px-4 py-2 border border-gray-300 rounded text-black"
                  disabled
                />
              </div>

              {/* Points Input, Trash Bin, and Required Toggle */}
              <div className="flex justify-end items-center mt-4">
                {/* Trash Bin and Required Toggle */}
                <div className="flex items-center space-x-4">
                  {/* Trash Bin */}
                  <button
                    onClick={() => deleteQuestion(section.id, question.id)}
                    className="text-gray-500"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-5 h-5" />
                  </button>

                  {/* Required Toggle */}
                  <div className="flex items-center">
                    <span className="text-black mr-2">จำเป็น</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={question.isRequired}
                        onChange={() => toggleRequired(section.id, question.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-300 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#03A9F4]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {question.type === "multiple_choice" && (
            <div>
              {question.options.map((option, idx) => (
                <div key={idx} className="flex flex-col mb-4">
                  <div className="flex items-center mb-2">
                    <div className="relative flex items-center w-full">
                      <FontAwesomeIcon
                        icon={faGripVertical}
                        className="mr-2 text-gray-400"
                      />
                      <input type="radio" className="mr-2" disabled />

                      {/* Option Input */}
                      <input
                        type="text"
                        value={option.text || ""}
                        onChange={(e) =>
                          updateOption(
                            section.id,
                            question.id,
                            idx,
                            e.target.value
                          )
                        }
                        placeholder={`ตัวเลือก ${idx + 1}`}
                        className="w-full px-4 py-2 border border-gray-300 rounded text-black pr-10" // ใช้ `pr-10` เพื่อเว้นที่สำหรับไอคอน
                      />
                      {/* Upload Image Button */}
                      <button
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                        onClick={() =>
                          document.getElementById(`file-upload-${idx}`).click()
                        }
                      >
                        <FontAwesomeIcon icon={faImage} className="w-6 h-6" />
                      </button>

                      {/* Hidden File Input */}
                      <input
                        type="file"
                        id={`file-upload-${idx}`}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) =>
                          handleUploadImage(e, section.id, question.id, idx)
                        }
                      />
                    </div>

                    {/* Delete Option Button */}
                    <button
                      onClick={() => removeOption(section.id, question.id, idx)}
                      className="ml-2 text-red-500"
                    >
                      ✖️
                    </button>
                  </div>

                  {/* Show Uploaded Image */}
                  {option.image && (
                    <div className="mt-2 ms-10 flex justify-start">
                      <img
                        src={option.image}
                        alt={`ตัวเลือก ${idx + 1}`}
                        className="w-4/5 max-h-80 object-contain border border-gray-300 rounded"
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Add New Option Button */}
              <button
                onClick={() => addOption(section.id, question.id)}
                className="text-[#03A9F4] mb-2"
              >
                + เพิ่มตัวเลือกใหม่
              </button>

              {/* Points Input, Trash Bin, and Required Toggle */}
              <div className="flex justify-end items-center mt-4">
                {/* Trash Bin and Required Toggle */}
                <div className="flex items-center space-x-4">
                  {/* Trash Bin */}
                  <button
                    onClick={() => deleteQuestion(section.id, question.id)}
                    className="text-gray-500"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-5 h-5" />
                  </button>

                  {/* Required Toggle */}
                  <div className="flex items-center">
                    <span className="text-black mr-2">จำเป็น</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={question.isRequired}
                        onChange={() => toggleRequired(section.id, question.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-300 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#03A9F4]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {question.type === "dropdown" && (
            <div>
              {/* Dropdown Preview */}
              <select className="w-full px-4 py-2 mb-2 border border-gray-300 rounded text-black">
                <option disabled value="">
                  เมนูดรอปดาวน์
                </option>
                {question.options.map((option, idx) => (
                  <option key={idx} value={option}>
                    {option || `ตัวเลือก ${idx + 1}`}
                  </option>
                ))}
              </select>

              {/* Options List */}
              {question.options.map((option, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <FontAwesomeIcon
                    icon={faGripVertical}
                    className="mr-2 text-gray-400"
                  />

                  <input type="radio" className="mr-2" disabled />

                  <input
                    type="text"
                    value={option}
                    onChange={(e) =>
                      updateOption(section.id, question.id, idx, e.target.value)
                    }
                    placeholder={`ตัวเลือก ${idx + 1}`}
                    className="w-full px-4 py-2 border border-gray-300 rounded text-black"
                  />
                  <button
                    onClick={() => removeOption(section.id, question.id, idx)}
                    className="ml-2 text-red-500"
                  >
                    ✖️
                  </button>
                </div>
              ))}

              {/* Add New Option Button */}
              <button
                onClick={() => addOption(section.id, question.id)}
                className="text-[#03A9F4] mb-2"
              >
                + เพิ่มตัวเลือกใหม่
              </button>

              {/* Points Input, Trash Bin, and Required Toggle */}
              <div className="flex justify-end items-center mt-4">
                {/* Trash Bin and Required Toggle */}
                <div className="flex items-center space-x-4">
                  {/* Trash Bin */}
                  <button
                    onClick={() => deleteQuestion(section.id, question.id)}
                    className="text-gray-500"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-5 h-5" />
                  </button>

                  {/* Required Toggle */}
                  <div className="flex items-center">
                    <span className="text-black mr-2">จำเป็น</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={question.isRequired}
                        onChange={() => toggleRequired(section.id, question.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-300 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#03A9F4]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

{question.type === "checkbox" && (
  <div>
    {/* Options List */}
    <div>
      {question.options.map((option, idx) => (
        <div key={idx} className="flex flex-col mb-4">
          <div className="relative flex items-center w-full mb-2">
            <FontAwesomeIcon
              icon={faGripVertical}
              className="mr-2 text-gray-400"
            />
            <input type="checkbox" className="mr-2" disabled />

            {/* Option Input */}
            <div className="relative w-full">
              <input
                type="text"
                value={option.text || ""}
                onChange={(e) =>
                  updateOption(section.id, question.id, idx, e.target.value)
                }
                placeholder={`ตัวเลือก ${idx + 1}`}
                className="w-full px-4 py-2 border border-gray-300 rounded text-black pr-10"
              />

              {/* Image Upload Icon */}
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() =>
                  document.getElementById(`file-upload-${section.id}-${idx}`).click()
                }
              >
                <FontAwesomeIcon icon={faImage} className="w-6 h-6" />
              </button>

              {/* Hidden File Input */}
              <input
                type="file"
                id={`file-upload-${section.id}-${idx}`}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleUploadImage(e, section.id, question.id, idx)}
              />
            </div>

            {/* Delete Option Button */}
            <button
              onClick={() => removeOption(section.id, question.id, idx)}
              className="ml-2 text-red-500"
            >
              ✖️
            </button>
          </div>

          {/* Show Uploaded Image */}
          {option.image && (
            <div className="mt-2 ms-10 flex justify-start">
              <img
                src={option.image}
                alt={`ตัวเลือก ${idx + 1}`}
                className="w-4/5 max-h-80 object-contain border border-gray-300 rounded"
              />
            </div>
          )}
        </div>
      ))}

      {/* Add New Option */}
      <button
        onClick={() => addOption(section.id, question.id)}
        className="text-[#03A9F4]"
      >
        + เพิ่มตัวเลือกใหม่
      </button>
    </div>

    {/* Max Select Dropdown */}
    <div className="flex items-center mt-4">
      <span className="mr-2 text-black">เลือกสูงสุด:</span>
      <select
        value={question.maxSelect || 1}
        onChange={(e) =>
          updateMaxSelect(section.id, question.id, parseInt(e.target.value))
        }
        className="border border-gray-300 rounded px-2 py-1 text-black"
      >
        {question.options.map((_, idx) => (
          <option key={idx} value={idx + 1}>
            {idx + 1}
          </option>
        ))}
      </select>
    </div>

    {/* Points Input, Trash Bin, and Required Toggle */}
    <div className="flex justify-end items-center mt-4">
      {/* Trash Bin and Required Toggle */}
      <div className="flex items-center space-x-4">
        {/* Trash Bin */}
        <button
          onClick={() => deleteQuestion(section.id, question.id)}
          className="text-gray-500"
        >
          <FontAwesomeIcon icon={faTrash} className="w-5 h-5" />
        </button>

        {/* Required Toggle */}
        <div className="flex items-center">
          <span className="text-black mr-2">จำเป็น</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={question.isRequired}
              onChange={() => toggleRequired(section.id, question.id)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-300 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#03A9F4]"></div>
          </label>
        </div>
      </div>
    </div>
  </div>
)}


          {/* If date, show a date picker */}
          {question.type === "date" && (
            <div className="mb-4">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="(วัน/เดือน/ปี)"
                  className="w-full px-4 py-2 border border-gray-300 rounded text-black pr-10" // เพิ่ม `pr-10` เพื่อเว้นที่สำหรับไอคอน
                  disabled
                />
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="absolute right-3 text-gray-500 w-5 h-5" // วางตำแหน่งไอคอนด้านขวา
                />
              </div>
              <div className="flex justify-end items-center mt-4">
                {/* Trash Bin and Required Toggle */}
                <div className="flex items-center space-x-4">
                  {/* Trash Bin */}
                  <button
                    onClick={() => deleteQuestion(section.id, question.id)}
                    className="text-gray-500"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-5 h-5" />
                  </button>

                  {/* Required Toggle */}
                  <div className="flex items-center">
                    <span className="text-black mr-2">จำเป็น</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={question.isRequired}
                        onChange={() => toggleRequired(section.id, question.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-300 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#03A9F4]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* If rating, show a rating scale */}
          {question.type === "rating" && (
            <div className="mb-4">
              <div className="flex items-center mb-2">
                {[...Array(question.ratingLevel)].map((_, idx) => (
                  <FontAwesomeIcon
                    key={idx}
                    icon={faStar}
                    className="w-6 h-6 text-gray-400 mr-4"
                  />
                ))}
              </div>
              <div className="flex items-center">
                <span className="mr-2 text-black">ระดับคะแนน :</span>
                <select
                  value={question.ratingLevel}
                  onChange={(e) =>
                    updateRatingLevel(
                      section.id,
                      question.id,
                      parseInt(e.target.value)
                    )
                  }
                  className="border border-gray-300 text-black rounded px-2 py-1"
                >
                  {Array.from({ length: 11 }, (_, idx) => (
                    <option key={idx} value={idx}>
                      {idx}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end items-center mt-4">
                {/* Trash Bin and Required Toggle */}
                <div className="flex items-center space-x-4">
                  {/* Trash Bin */}
                  <button
                    onClick={() => deleteQuestion(section.id, question.id)}
                    className="text-gray-500"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-5 h-5" />
                  </button>

                  {/* Required Toggle */}
                  <div className="flex items-center">
                    <span className="text-black mr-2">จำเป็น</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={question.isRequired}
                        onChange={() => toggleRequired(section.id, question.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-300 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#03A9F4]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {section.questions.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => toggleQuestionTypesVisibility(section.id)}
            className="text-[#03A9F4] font-bold mb-2"
          >
            {section.showQuestionTypes
              ? "+ เพิ่มคำถามใหม่"
              : "+ เพิ่มคำถามใหม่"}
          </button>
          {section.showQuestionTypes && (
            <div className="grid grid-cols-3 gap-2">
              {questionTypes.map((qType) => (
                <button
                  key={qType.value}
                  onClick={() => addQuestion(section.id, qType.value)}
                  className="flex items-center px-4 py-2 bg-gray-200 rounded-full"
                >
                  <span className="mr-2">{qType.icon}</span>
                  <span className="text-black">{qType.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center mt-6 space-x-3">
        <button
          onClick={() => addSection()}
          className="w-full mt-2 px-4 py-2 bg-gray-200 rounded text-black"
        >
          + เพิ่มส่วนใหม่
        </button>
        {section.id !== 1 && (
          <button
            onClick={() => deleteSection(section.id)}
            className="w-1/8 mt-2 px-4 py-2 bg-red-500 rounded text-white"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Section;