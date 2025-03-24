'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Pie = dynamic(() => import('chart.js/auto').then(() => import('react-chartjs-2').then((mod) => mod.Pie)), { ssr: false });
const Bar = dynamic(() => import('chart.js/auto').then(() => import('react-chartjs-2').then((mod) => mod.Bar)), { ssr: false });

const ResponsePage = ({ quizId, formType }) => {
  const [header, setHeader] = useState({ title: '', total_response: 0 });
  const [questions, setQuestions] = useState([]);

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

  // ฟังก์ชันสร้างกล่องแสดงหัวข้อและจำนวนการตอบกลับ
  const renderHeaderSummary = () => (
    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow mb-4">
      <div>
        <h2 className="text-xl font-bold">{header.title}</h2>
        <p className="text-gray-600">
          <span className="text-2xl font-bold text-black">{header.total_response}</span> การตอบกลับ
        </p>
      </div>
      <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
        เปิดใน Sheet
      </button>
    </div>
  );


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
    </div>
  );


};

export default ResponsePage;