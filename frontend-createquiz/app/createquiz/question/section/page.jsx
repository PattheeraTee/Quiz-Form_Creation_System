// components/Section.js
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faCalendarAlt, faStar, faGripVertical } from "@fortawesome/free-solid-svg-icons";

const Section = ({
  section,
  questionTypes,
  addQuestion,
  updateOption,
  updateRatingLevel,
  addOption,
  removeOption,
  updateMaxSelect,
  toggleRequired,
  deleteQuestion,
  deleteSection,
  toggleQuestionTypesVisibility,
  addSection,
}) => {
  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white p-6 rounded-xl shadow relative">
      <h3 className="text-xl font-semibold mb-2 text-black">ส่วนที่ {section.id}</h3>
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
          <div className="flex items-center mb-2">
            <input
              type="text"
              placeholder="คำถาม"
              className="w-full px-4 py-2 border border-gray-300 rounded text-black"
            />
            <button className="ml-4 text-gray-500">
              <FontAwesomeIcon
                icon={faImage}
                className="w-6 h-6 text-gray-500"
              />
            </button>
          </div>

          {/* If text_input, show a simple text area */}
          {question.type === "text_input" && (
            <div className="mb-4">
              <textarea
                placeholder="กรอกคำตอบของคุณ"
                className="w-full px-4 py-2 border border-gray-300 rounded text-black"
              />
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => deleteQuestion(section.id, question.id)}
                  className="text-red-500"
                >
                  ลบคำถาม
                </button>
                <div className="flex items-center">
                  <span className="text-black mr-2">จำเป็น</span>
                  <input
                    type="checkbox"
                    checked={question.isRequired}
                    onChange={() => toggleRequired(section.id, question.id)}
                    className="toggle-checkbox"
                  />
                </div>
              </div>
            </div>
          )}

          {/* If multiple choice, show options */}
          {question.type === "multiple_choice" && (
            <div>
              {question.options.map((option, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faGripVertical} className="mr-2 text-gray-400" />
                  <input type="radio" className="mr-2" disabled />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) =>
                      updateOption(
                        section.id,
                        question.id,
                        idx,
                        e.target.value
                      )
                    }
                    placeholder={`ตัวเลือก ${idx + 1}`}
                    className="w-full px-4 py-2 border border-gray-300 rounded text-black"
                  />
                  <button
                    onClick={() =>
                      removeOption(section.id, question.id, idx)
                    }
                    className="ml-2 text-red-500"
                  >
                    ✖️
                  </button>
                </div>
              ))}
              <button
                onClick={() => addOption(section.id, question.id)}
                className="text-[#03A9F4] underline mb-2"
              >
                + เพิ่มตัวเลือกใหม่
              </button>
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => deleteQuestion(section.id, question.id)}
                  className="text-red-500"
                >
                  ลบคำถาม
                </button>
                <div className="flex items-center">
                  <span className="text-black mr-2">จำเป็น</span>
                  <input
                    type="checkbox"
                    checked={question.isRequired}
                    onChange={() => toggleRequired(section.id, question.id)}
                    className="toggle-checkbox"
                  />
                </div>
              </div>
            </div>
          )}

          {/* If dropdown, show options */}
          {question.type === "dropdown" && (
            <div>
              <select className="w-full px-4 py-2 mb-2 border border-gray-300 rounded text-black">
                {question.options.map((option, idx) => (
                  <option key={idx} value={option}>
                    {option || `ตัวเลือก ${idx + 1}`}
                  </option>
                ))}
              </select>
              {question.options.map((option, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faGripVertical} className="mr-2 text-gray-400" />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) =>
                      updateOption(
                        section.id,
                        question.id,
                        idx,
                        e.target.value
                      )
                    }
                    placeholder={`ตัวเลือก ${idx + 1}`}
                    className="w-full px-4 py-2 border border-gray-300 rounded text-black"
                  />
                  <button
                    onClick={() =>
                      removeOption(section.id, question.id, idx)
                    }
                    className="ml-2 text-red-500"
                  >
                    ✖️
                  </button>
                </div>
              ))}
              <button
                onClick={() => addOption(section.id, question.id)}
                className="text-[#03A9F4] underline mb-2"
              >
                + เพิ่มตัวเลือกใหม่
              </button>
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => deleteQuestion(section.id, question.id)}
                  className="text-red-500"
                >
                  ลบคำถาม
                </button>
                <div className="flex items-center">
                  <span className="text-black mr-2">จำเป็น</span>
                  <input
                    type="checkbox"
                    checked={question.isRequired}
                    onChange={() => toggleRequired(section.id, question.id)}
                    className="toggle-checkbox"
                  />
                </div>
              </div>
            </div>
          )}

          {/* If checkbox, show options with maxSelect */}
          {question.type === "checkbox" && (
            <div>
              {question.options.map((option, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faGripVertical} className="mr-2 text-gray-400" />
                  <input type="checkbox" className="mr-2" disabled />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) =>
                      updateOption(
                        section.id,
                        question.id,
                        idx,
                        e.target.value
                      )
                    }
                    placeholder={`ตัวเลือก ${idx + 1}`}
                    className="w-full px-4 py-2 border border-gray-300 rounded text-black"
                  />
                  <button
                    onClick={() =>
                      removeOption(section.id, question.id, idx)
                    }
                    className="ml-2 text-red-500"
                  >
                    ✖️
                  </button>
                </div>
              ))}
              <button
                onClick={() => addOption(section.id, question.id)}
                className="text-[#03A9F4] underline mb-2"
              >
                + เพิ่มตัวเลือกใหม่
              </button>
              <div className="flex items-center mb-4">
                <span className="mr-2 text-black">เลือกสูงสุด:</span>
                <select
                  value={question.maxSelect}
                  onChange={(e) =>
                    updateMaxSelect(
                      section.id,
                      question.id,
                      parseInt(e.target.value)
                    )
                  }
                  className="border border-gray-300 text-black rounded px-2 py-1"
                >
                  {question.options.map((_, idx) => (
                    <option key={idx} value={idx + 1}>
                      {idx + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => deleteQuestion(section.id, question.id)}
                  className="text-red-500"
                >
                  ลบคำถาม
                </button>
                <div className="flex items-center">
                  <span className="text-black mr-2">จำเป็น</span>
                  <input
                    type="checkbox"
                    checked={question.isRequired}
                    onChange={() => toggleRequired(section.id, question.id)}
                    className="toggle-checkbox"
                  />
                </div>
              </div>
            </div>
          )}

          {/* If date, show a date picker */}
          {question.type === "date" && (
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="(ว/ด/ป)"
                  className="w-full px-4 py-2 border border-gray-300 rounded text-black"
                />
                <button className="ml-2 text-gray-500">
                  <FontAwesomeIcon
                    icon={faCalendarAlt}
                    className="w-6 h-6 text-gray-500"
                  />
                </button>
              </div>
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => deleteQuestion(section.id, question.id)}
                  className="text-red-500"
                >
                  ลบคำถาม
                </button>
                <div className="flex items-center">
                  <span className="text-black mr-2">จำเป็น</span>
                  <input
                    type="checkbox"
                    checked={question.isRequired}
                    onChange={() => toggleRequired(section.id, question.id)}
                    className="toggle-checkbox"
                  />
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
                    className="w-6 h-6 text-gray-400 mr-1"
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
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => deleteQuestion(section.id, question.id)}
                  className="text-red-500"
                >
                  ลบคำถาม
                </button>
                <div className="flex items-center">
                  <span className="text-black mr-2">จำเป็น</span>
                  <input
                    type="checkbox"
                    checked={question.isRequired}
                    onChange={() => toggleRequired(section.id, question.id)}
                    className="toggle-checkbox"
                  />
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
            {section.showQuestionTypes ? "+ เพิ่มคำถามใหม่" : "+ เพิ่มคำถามใหม่"}
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
            className="w-1/5 mt-2 px-4 py-2 bg-red-500 rounded text-white"
          >
            ลบส่วนนี้
          </button>
        )}
      </div>
    </div>
  );
};

export default Section;
