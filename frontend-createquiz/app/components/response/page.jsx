'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';

const Pie = dynamic(() => import('chart.js/auto').then(() => import('react-chartjs-2').then((mod) => mod.Pie)), { ssr: false });
const Bar = dynamic(() => import('chart.js/auto').then(() => import('react-chartjs-2').then((mod) => mod.Bar)), { ssr: false });

const ResponsePage = ({ quizId, formType }) => {
  const [header, setHeader] = useState({ title: '', total_response: 0 });
  const [questions, setQuestions] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    if (quizId) {
      fetch(`http://localhost:3001/response/form/${quizId}?type=${formType}`)
        .then((response) => response.json())
        .then((data) => {
          setHeader({ title: data.title, total_response: data.total_response });
          setQuestions(data.questions || []);
        })
        .catch((error) => {
          console.error('Error fetching quiz data:', error);
        });
    }
  }, [quizId, formType]);

  const fetchDetailResponses = async () => {
    try {
      const res = await fetch(`http://localhost:3001/response/form/${quizId}/detail?type=${formType}`);
      const data = await res.json();
  
      if (data.userResponses) {
        setDetailData(data.userResponses);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching detailed responses:', error);
    }
  };

  const generateColors = (count) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * (360 / count)) % 360; // กระจายสีในวงล้อสี
      colors.push(`hsl(${hue}, 65%, 75%)`); // ความอิ่มตัว 50% และความสว่าง 80% สำหรับโทนพาสเทล
    }
    return colors;
  };

  const renderPieChart = (options) => {
    const labels = options.map((option) => option.text);
    const data = options.map((option) => option.count);
    const colors = generateColors(options.length); // สร้างสีตามจำนวนตัวเลือก

    return (
      <Pie
        data={{
          labels,
          datasets: [
            {
              data,
              backgroundColor: colors,
            },
          ],
        }}
        options={{
          maintainAspectRatio: true,
        }}
      />
    );
  };

  const renderOptionList = (options) => {
  const colors = generateColors(options.length);
    return (
      <ul>
        {options.map((option, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <span className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: colors[idx],
                }}
              ></span>
              <span className="text-black">{option.text}</span>
            </span>
            <span className="ml-auto text-gray-900 font-bold">{option.count}</span>
          </li>
        ))}
      </ul>
    );
  };

  const renderBarChart = (answerRatingCount) => {
    const labels = Object.keys(answerRatingCount).sort();
    const data = labels.map((label) => answerRatingCount[label]);

    return (
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: 'Ratings',
              data,
              backgroundColor: '#9747FF',
            },
          ],
        }}
        options={{
          maintainAspectRatio: true,
        }}
      />
    );
  };

  const renderSummaryBox = (value, label) => (
    <div className="flex flex-col items-center">
      <p className="text-2xl font-bold mb-2">{value}</p>
      <p className="text-lg text-gray-600">{label}</p>
    </div>
  );

  const renderTextResponses = (responses) => (
    <div>
      <h4 className="text-lg font-semibold mb-2">การตอบกลับล่าสุด</h4>
      <div>
        {responses.slice(0, 3).map((response, idx) => (
          <p key={idx}>&quot;{response}&quot;</p>
        ))}
      </div>
    </div>
  );

  // const renderHeaderSummary = (title, totalResponse) => (
  //   <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow mb-4">
  //     <div>
  //       <h2 className="text-xl font-bold">{title}</h2>
  //       <p className="text-gray-600 text-2xl font-bold mt-2">{totalResponse} <span className=" text-xl">การตอบกลับ</span> </p>
  //     </div>
  //     <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
  //       เปิดใน Sheet
  //     </button>
  //   </div>
  // );

  const downloadExcelFile = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/response/download/${quizId}`, {
        responseType: 'blob',
      });
  
      // ตั้งชื่อไฟล์โดยใช้ header.title
      const rawTitle = header.title || "responses";
      const safeTitle = rawTitle.replace(/[^a-zA-Z0-9ก-๙\s_-]/g, "").replace(/\s+/g, "_");
      const fileName = `response_${safeTitle}.xlsx`;
  
      // สร้าง blob URL
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // cleanup
    } catch (error) {
      console.error("❌ Error downloading file:", error);
    }
  };
  
  

  // ฟังก์ชันสร้างกล่องแสดงหัวข้อและจำนวนการตอบกลับ
  const renderHeaderSummary = () => (
    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow mb-4">
      <div>
        <h2 className="text-xl font-bold">{header.title}</h2>
        <p className="text-gray-600">
          <span className="text-2xl font-bold text-black">{header.total_response}</span> การตอบกลับ
        </p>
      </div>
      <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"       onClick={downloadExcelFile}
      >
        ดาวโหลด excel
      </button>
    </div>
  );

  const handleEvaluateWithAI = async () => {
    if (!selectedQuestionId) return;
    setIsEvaluating(true);
  
    try {
      const response = await fetch(`http://localhost:3001/response/text-input/${selectedQuestionId}`);
      const questionData = await response.json();
  
      const previewRes = await fetch(`http://localhost:3001/evaluate-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      });
  
      const result = await previewRes.json();

      console.log("AI Evaluation Preview:", result);

      setEvaluation(result.evaluation);
      setIsEvaluating(false);
    } catch (error) {
      console.error("AI Evaluation error:", error);
      setIsEvaluating(false);
    }
  };
  
  const handleAcceptEvaluation = async () => {
    try {
      const res = await fetch(`http://localhost:3001/accept-evaluation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: selectedQuestionId,
          evaluation,
        }),
      });
  
      const result = await res.json();
      setIsAccepted(true);
  
      // ✅ อัปเดตข้อมูลใหม่ และซ่อน evaluation
      await fetchDetailResponses();
      setEvaluation(null); // ซ่อนผล AI หลังอัปเดตเสร็จ
    } catch (error) {
      console.error("Error accepting evaluation:", error);
    }
  };

  return (
    <div className="p-4 bg-[#F9F8F6] flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        {/* แสดงกล่องหัวข้อ */}
        {header && renderHeaderSummary()}

        {/* แสดงคำถาม */}
        {questions.map((question, index) => (
          <div key={index} className="bg-white rounded shadow p-4 mb-4 flex">
            <div className="w-1/2 pr-4">
              <h3 className="text-lg font-semibold mb-2">{question.question_text}</h3>
              <button
                className="mt-2 text-blue-600 text-sm underline hover:text-blue-800"
                onClick={() => {
                  const id = Array.isArray(question.question_id)
                    ? question.question_id[0]
                    : question.question_id;
                
                  setSelectedQuestionId(id);
                  setSelectedQuestion(question);
                  fetchDetailResponses();
                }}                
              >
                ดูรายละเอียด
              </button>
              {/* แสดงเปอร์เซ็นต์ตอบถูกเฉพาะ quiz */}
              {formType === "quiz" && (
                <p className="text-gray-600 text-xs pb-2">
                  {question.correct_percentage} ของผู้ตอบแบบสอบถามตอบคำถามข้อนี้ถูกต้อง
                </p>
              )}
              {question.total_answer_option?.length > 0 ? (
                renderOptionList(question.total_answer_option)
              ) : question.average_rating !== null ? (
                renderSummaryBox(
                  question.average_rating.toFixed(2),
                  "ค่าเฉลี่ยคะแนน"
                )
              ) : (
                renderSummaryBox(
                  question.total_answer_question,
                  "การตอบกลับ"
                )
              )}
            </div>
            <div className="w-1/2">
              {question.total_answer_option?.length > 0 ? (
                renderPieChart(question.total_answer_option)
              ) : question.average_rating !== null ? (
                renderBarChart(question.answer_rating_count)
              ) : question.recent_answers?.length > 0 ? (
                renderTextResponses(question.recent_answers)
              ) : (
                <p>ไม่มีข้อมูลเพิ่มเติม</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {showDetailModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full shadow-lg overflow-y-auto max-h-[80vh]">
            {/* ✅ ปุ่มตรวจสอบ AI เฉพาะ text_input */}
            {formType === "quiz" && selectedQuestion?.type === "text_input" && (
              <div className="flex justify-end mb-2">
                <button
                  className="bg-[#03A9F4] text-white px-4 py-1 rounded hover:bg-[#0B76BC] text-sm"
                  onClick={handleEvaluateWithAI}
                  disabled={isEvaluating}
                >
                  {isEvaluating ? "กำลังประเมิน..." : "ตรวจสอบคำตอบด้วย AI"}
                </button>
              </div>
            )}
            {/* ✅ แสดงคำถามและจำนวนการตอบกลับ */}
            <h2 className="text-xl font-bold mb-1">คำถาม: {selectedQuestion.question_text}</h2>
            <p className="text-gray-600 mb-4">
              {(() => {
                // ดึงจำนวนการตอบกลับจากข้อมูล selectedQuestion
                if (selectedQuestion.total_answer_question !== undefined) {
                  return `${selectedQuestion.total_answer_question} การตอบกลับ`;
                } else if (selectedQuestion.total_answer_option?.length > 0) {
                  return `${selectedQuestion.total_answer_option.reduce((sum, opt) => sum + opt.count, 0)} การตอบกลับ`;
                } else {
                  return '';
                }
              })()}
            </p>

            {/* ตารางคำตอบ */}
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">ผู้ตอบ</th>
                  <th className="border p-2 text-left">คำตอบ</th>
                  {formType === "quiz" && (
                    <th className="border p-2 text-left">คะแนน</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {detailData.map((user, idx) => {
                  const target = user.responses.find((r) => {
                    if (Array.isArray(r.question_id)) {
                      return r.question_id.includes(selectedQuestionId);
                    } else {
                      return r.question_id === selectedQuestionId;
                    }
                  });
                  if (!target) return null;

                  return (
                    <tr key={idx}>
                      <td className="border p-2">{user.email || 'anonymous'}</td>
                      <td className="border p-2">
                        {target.response_text
                          ? target.response_text
                          : target.selected_options?.join(', ') || "-"}
                      </td>
                      {formType === "quiz" && (
                        <td className="border p-2">{target.question_score ?? '-'}</td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* ✅ แสดงผล AI Evaluation ถ้ามี */}
            {evaluation && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-bold mb-2">ผลการประเมินด้วย AI</h3>
                <ul className="mb-4">
                  {evaluation.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center mb-1">
                      <span>{item.answer}</span>
                      <span className={item.is_correct ? "text-green-600 font-semibold" : "text-red-600"}>
                        {item.is_correct ? "✔️ ถูกต้อง" : "❌ ไม่ถูกต้อง"}
                      </span>
                    </li>
                  ))}
                </ul>
                {!isAccepted ? (
                <div className="flex items-center gap-3">
                  <button
                    className="bg-[#9D9D9D] text-white px-4 py-2 rounded hover:bg-[#434146]"
                    onClick={handleEvaluateWithAI}
                    disabled={isEvaluating}
                  >
                    {isEvaluating ? "กำลังประเมินใหม่..." : "ประเมินใหม่"}
                  </button>
                  <button
                    className="bg-[#03A9F4] text-white px-4 py-2 rounded hover:bg-[#0B76BC]"
                    onClick={handleAcceptEvaluation}
                  >
                    ยืนยันการตรวจคำตอบ
                  </button>
                </div>
              ) : (
                <p className="text-green-700 font-medium">อัปเดตคะแนนเรียบร้อยแล้ว</p>
              )}
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedQuestion(null);
                  setEvaluation(null); // ซ่อนผล AI เมื่อปิด
                  setIsAccepted(false); // รีเซ็ตปุ่มยืนยัน
                }}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsePage;