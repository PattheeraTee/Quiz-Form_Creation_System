'use client';
import { useState } from 'react';
import ColorPicker from '../colorpicker/page';

export default function ButtonCustomizer() {
  const [buttonText, setButtonText] = useState('');
  const [buttonSize, setButtonSize] = useState('');
  const [buttonRadius, setButtonRadius] = useState('');
  const [textColor, setTextColor] = useState('#89E78D');
  const [buttonColor, setButtonColor] = useState('#FFFFFF');
  const [showBorder, setShowBorder] = useState(true);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isTextColorPickerOpen, setIsTextColorPickerOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(true);

  if (!isCustomizerOpen) return null;

  return (
    <div className="fixed top-4 right-4 w-80 p-4 bg-white rounded-lg shadow border border-gray-300 text-black mt-32">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">ข้อความในปุ่ม</h2>
        <button onClick={() => setIsCustomizerOpen(false)} className="text-3xl">&times;</button>
      </div>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">ข้อความในปุ่ม</label>
        <input
          type="text"
          value={buttonText}
          onChange={(e) => setButtonText(e.target.value)}
          placeholder="กรอกข้อความที่ต้องการแสดง"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">ขนาดปุ่ม</label>
        <select
          value={buttonSize}
          onChange={(e) => setButtonSize(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">เลือกขนาดปุ่ม</option>
          <option value="small">เล็ก</option>
          <option value="medium">กลาง</option>
          <option value="large">ใหญ่</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">มุมขอบของปุ่ม</label>
        <select
          value={buttonRadius}
          onChange={(e) => setButtonRadius(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">เลือกขอบปุ่ม</option>
          <option value="none">ไม่มีมุม</option>
          <option value="rounded">มน</option>
          <option value="pill">มนแบบเต็ม</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">สีตัวอักษร</label>
        <div className="flex items-center">
          <button
            className="w-8 h-8 mr-2 rounded border border-gray-300"
            style={{ backgroundColor: textColor }}
            onClick={() => setIsTextColorPickerOpen(true)}
          ></button>
          <input
            type="text"
            value={textColor}
            onClick={() => setIsTextColorPickerOpen(true)}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {isTextColorPickerOpen && (
          <ColorPicker
            color={textColor}
            onChange={setTextColor}
            onClose={() => setIsTextColorPickerOpen(false)}
          />
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">สีปุ่ม</label>
        <div className="flex items-center">
          <button
            className="w-8 h-8 mr-2 rounded border border-gray-300"
            style={{ backgroundColor: buttonColor }}
            onClick={() => setIsColorPickerOpen(true)}
          ></button>
          <input
            type="text"
            value={buttonColor}
            onClick={() => setIsColorPickerOpen(true)}
            onChange={(e) => setButtonColor(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {isColorPickerOpen && (
          <ColorPicker
            color={buttonColor}
            onChange={setButtonColor}
            onClose={() => setIsColorPickerOpen(false)}
          />
        )}
      </div>
      <div className="mb-4 flex items-center">
        <label className="mr-2 text-sm font-medium">แสดงขอบ</label>
        <div
          className={`relative inline-block w-12 h-6 cursor-pointer ${
            showBorder ? 'bg-[#03A9F4]' : 'bg-gray-300'
          } rounded-full transition-colors duration-200`}
          onClick={() => setShowBorder(!showBorder)} // Toggle on click
        >
          <span
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
              showBorder ? 'translate-x-6' : 'translate-x-0'
            }`}
          ></span>
        </div>
      </div>
    </div>
  );
}
