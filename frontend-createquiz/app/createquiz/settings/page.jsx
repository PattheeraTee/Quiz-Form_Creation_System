'use client';
import { useState } from 'react';

export default function SettingsForm() {
  const [emailIncluded, setEmailIncluded] = useState(false);
  const [limitToOneResponse, setLimitToOneResponse] = useState(false);
  const [allowResponse, setAllowResponse] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('23:50');
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  return (
    <div className="bg-white text-black  max-w-2xl mx-auto p-6 rounded-xl shadow mt-6">
      <h2 className="text-lg font-semibold mb-4">การตั้งค่า</h2>
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-xl font-medium mb-2">การตอบกลับ</h3>
        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={emailIncluded}
            onChange={() => setEmailIncluded(!emailIncluded)}
            className="mr-2"
          />
          รวมรวมที่อยู่อีเมล
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={limitToOneResponse}
            onChange={() => setLimitToOneResponse(!limitToOneResponse)}
            className="mr-2"
          />
          จํากัดการตอบกลับ 1 ครั้ง
        </label>
      </div>
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-xl font-medium mb-2">การตอบสนอง</h3>
        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={allowResponse}
            onChange={() => setAllowResponse(!allowResponse)}
            className="mr-2"
          />
          ยอมรับการตอบกลับ
        </label>
        <div className="mb-2">
          <label className="block mb-1">วันที่เริ่มต้น</label>
          <div className="flex items-center">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mr-2 p-2 border rounded"
            />
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="08:00">08:00</option>
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
              {/* Add more options as needed */}
            </select>
          </div>
        </div>
        <div className="mb-2">
          <label className="block mb-1">วันที่สิ้นสุด</label>
          <div className="flex items-center">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mr-2 p-2 border rounded"
            />
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="23:50">23:50</option>
              <option value="22:00">22:00</option>
              <option value="21:00">21:00</option>
              {/* Add more options as needed */}
            </select>
          </div>
        </div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={shuffleQuestions}
            onChange={() => setShuffleQuestions(!shuffleQuestions)}
            className="mr-2"
          />
          สลับคําถาม
        </label>
      </div>
    </div>
  );
}
