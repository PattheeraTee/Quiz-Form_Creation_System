'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);
const Pie = dynamic(() => import('chart.js/auto').then(() => import('react-chartjs-2').then((mod) => mod.Pie)), { ssr: false });
const Bar = dynamic(() => import('chart.js/auto').then(() => import('react-chartjs-2').then((mod) => mod.Bar)), { ssr: false });

const ResponsePage = () => {
  const router = useRouter();
  const quizId = router.query?.quizId || 'd123e456-7890-4abc-1234-56789abcdef0';
  const [summary, setSummary] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    if (quizId) {
      fetch(`http://localhost:3001/responses?quizId=${quizId}`)
        .then((response) => response.json())
        .then((data) => {
          setSummary(data.summary);
          setResponses(data.responses);
        })
        .catch((error) => {
          console.error('Error fetching responses:', error);
        });

      fetch(`http://localhost:3001/quiz/${quizId}`)
        .then((response) => response.json())
        .then((data) => {
          setQuizData(data);
        })
        .catch((error) => {
          console.error('Error fetching quiz data:', error);
        });
    }
  }, [quizId]);

  if (!summary || !quizData) {
    return <div>Loading...</div>;
  }

  const getQuestionText = (questionId) => {
    const question = quizData.sections.flatMap((section) => section.questions).find((q) => q.questionId === questionId);
    return question ? question.text : questionId;
  };

  const getOptionText = (questionId, optionId) => {
    const question = quizData.sections.flatMap((section) => section.questions).find((q) => q.questionId === questionId);
    const option = question?.options.find((opt) => opt.optionId === optionId);
    return option ? option.text : optionId;
  };

  const handleViewDetails = (questionId) => {
    const questionResponses = responses.map((response, index) => {
      const answer = response.answers.find((ans) => ans.questionId === questionId);
      let responseText = 'ไม่ได้ตอบ';
      if (answer) {
        if (answer.selectedOptionId) {
          responseText = getOptionText(questionId, answer.selectedOptionId);
        } else if (answer.selectedOptionIds) {
          responseText = answer.selectedOptionIds.map((optId) => getOptionText(questionId, optId)).join(', ');
        } else if (answer.text) {
          responseText = answer.text;
        } else if (answer.date) {
          responseText = answer.date;
        } else if (answer.rating) {
          responseText = answer.rating;
        }
      }
      return {
        id: index + 1,
        name: response.userId,
        response: responseText,
      };
    });

    MySwal.fire({
      title: `<strong>คำถาม : ${getQuestionText(questionId)}</strong>`,
      html: (
        <div>
          <table className="min-w-full bg-red-100">
            <thead>
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">ชื่อ</th>
                <th className="px-4 py-2">การตอบกลับ</th>
              </tr>
            </thead>
            <tbody>
              {questionResponses.map((res) => (
                <tr key={res.id}>
                  <td className="border px-4 py-2">{res.id}</td>
                  <td className="border px-4 py-2">{res.name}</td>
                  <td className="border px-4 py-2">{res.response}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
      showCloseButton: true,
    });
  };

  const renderPieChart = (options, questionId) => {
    const labels = options.map((option) => getOptionText(questionId, option.optionId));
    const data = options.map((option) => option.count);

    return (
      <div className="w-1/2">
        <Pie
          data={{
            labels,
            datasets: [
              {
                data,
                backgroundColor: ['#3498db', '#e74c3c', '#f1c40f', '#2ecc71'],
              },
            ],
          }}
          options={{
            maintainAspectRatio: true,
          }}
        />
      </div>
    );
  };

  const renderBarChart = (ratings) => {
    const ratingCounts = [1, 2, 3, 4, 5].map((rating) => ratings.filter((r) => r === rating).length);
    const averageRating = (ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length).toFixed(2);

    return (
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center mr-4">
          <p className="text-4xl font-bold mb-2">{averageRating}</p>
          <p className="text-lg text-gray-600">ค่าเฉลี่ยคะแนน</p>
        </div>
        <div className="w-1/3">
          <Bar
            data={{
              labels: ['1', '2', '3', '4', '5'],
              datasets: [
                {
                  label: 'Ratings',
                  data: ratingCounts,
                  backgroundColor: '#9b59b6',
                },
              ],
            }}
            options={{
              maintainAspectRatio: true,
            }}
          />
        </div>
      </div>
    );
  };

  const renderTextResponses = (responses) => {
    return (
      <div className="flex items-center justify-between">
        <div className="text-center">
          <p className="text-4xl font-bold mb-2">{responses.length}</p>
          <p className="text-lg text-gray-600">การตอบกลับ</p>
        </div>
        <div className="w-1/3">
          <h4 className="text-lg font-semibold mb-2">การตอบกลับล่าสุด</h4>
          <div className="text-gray-800">
            {responses.slice(-3).map((response, idx) => (
              <p key={idx}>&quot;{response}&quot;</p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDateResponses = (dates) => {
    return (
      <div className="flex items-center justify-between">
        <div className="text-center">
          <p className="text-4xl font-bold mb-2">{dates.length}</p>
          <p className="text-lg text-gray-600">การตอบกลับ</p>
        </div>
        <div className="w-1/3">
          <h4 className="text-lg font-semibold mb-2">การตอบกลับล่าสุด</h4>
          <div className="text-gray-800">
            {dates.slice(-3).map((date, idx) => (
              <p key={idx}>&quot;{date}&quot;</p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 text-black bg-[#F9F8F6]">
      <div className="bg-white rounded shadow p-4 mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold mb-2">{quizData.coverPage.quizTitle}</h2>
          <p className="text-gray-600">{summary.totalResponses} การตอบกลับ</p>
        </div>
        <button className="text-white bg-green-500 rounded px-4 py-2">เปิดใน sheet</button>
      </div>

      {summary.questions.map((question, index) => (
        <div key={index} className="bg-white rounded shadow p-4 mb-4">
          <h3 className="text-lg font-semibold mb-2">{getQuestionText(question.questionId)}</h3>
          <button
            className="text-gray-500 underline mb-4"
            onClick={() => handleViewDetails(question.questionId)}
          >
            ดูรายละเอียด
          </button>
          {question.summary.options ? (
            <div className="flex items-center justify-between">
              <div>
                {question.summary.options.map((option, idx) => (
                  <div key={idx} className="flex items-center mb-2">
                    <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: ['#3498db', '#e74c3c', '#f1c40f', '#2ecc71'][idx % 4] }}></span>
                    <p>{getOptionText(question.questionId, option.optionId)}: {option.count}</p>
                  </div>
                ))}
              </div>
              <div className="w-1/2">
                {renderPieChart(question.summary.options, question.questionId)}
              </div>
            </div>
          ) : question.summary.averageRating ? (
            renderBarChart(question.summary.averageRating)
          ) : question.summary.textResponses ? (
            renderTextResponses(question.summary.textResponses)
          ) : question.summary.dates ? (
            renderDateResponses(question.summary.dates)
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default ResponsePage;
