'use client';
import { useState } from 'react';

export default function SettingsForm() {
  const [emailIncluded, setEmailIncluded] = useState(false);
  const [limitToOneResponse, setLimitToOneResponse] = useState(false);
  const [allowResponse, setAllowResponse] = useState(false);
  const [enableStartDate, setEnableStartDate] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [enableEndDate, setEnableEndDate] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('00:00');
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  const generateTimeOptions = () => {
    const times = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 15) {
        const hour = i.toString().padStart(2, '0');
        const minute = j.toString().padStart(2, '0');
        times.push(`${hour}:${minute}`);
      }
    }
    return times;
  };

  const isPastDateTime = (date, time) => {
    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    return selectedDateTime < now;
  };

  return (
    <div className="bg-white text-black max-w-2xl mx-auto p-6 rounded-xl shadow mt-6">
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
        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={allowResponse}
            onChange={() => setAllowResponse(!allowResponse)}
            className="mr-2"
          />
          ยอมรับการตอบกลับ
        </label>
        <div className="mb-4">
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={enableStartDate}
              onChange={() => setEnableStartDate(!enableStartDate)}
              className="mr-2"
            />
            ใช้วันที่เริ่มต้น
          </label>
          {enableStartDate && (
            <div className="flex items-center mb-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mr-2 p-2 border rounded"
                min={new Date().toISOString().split('T')[0]}
              />
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="p-2 border rounded"
              >
                {generateTimeOptions().map((time) => (
                  <option
                    key={time}
                    value={time}
                    disabled={startDate && isPastDateTime(startDate, time)}
                  >
                    {time}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={enableEndDate}
              onChange={() => setEnableEndDate(!enableEndDate)}
              className="mr-2"
            />
            ใช้วันที่สิ้นสุด
          </label>
          {enableEndDate && (
            <div className="flex items-center">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mr-2 p-2 border rounded"
                min={new Date().toISOString().split('T')[0]}
              />
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="p-2 border rounded"
              >
                {generateTimeOptions().map((time) => (
                  <option
                    key={time}
                    value={time}
                    disabled={endDate && isPastDateTime(endDate, time)}
                  >
                    {time}
                  </option>
                ))}
              </select>
            </div>
          )}
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
