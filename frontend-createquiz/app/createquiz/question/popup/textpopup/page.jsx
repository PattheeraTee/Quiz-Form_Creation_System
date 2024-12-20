'use client';
import { useState } from 'react';
import ColorPicker from '../colorpicker/page';

const TextEditor = () => {
  const [textAlign, setTextAlign] = useState('left');
  const [fontSize, setFontSize] = useState('');
  const [textColor, setTextColor] = useState('#89E78D');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);
  const [showEditor, setShowEditor] = useState(true);

  if (!showEditor) return null;

  return (
    <div className="p-4 w-1/6 mt-0 fixed right-2 bg-white rounded-lg shadow-md ">
      <button 
        className="absolute top-2 right-2 text-gray-600 text-3xl"
        onClick={() => setShowEditor(false)}
      >
        &times;
      </button>
      <div className="flex items-center space-x-2 mb-4">
        <button className="font-bold text-lg border px-2 py-1 rounded text-black">B</button>
        <button className="italic text-lg border px-2 py-1 rounded text-black">I</button>
        <button className="underline text-lg border px-2 py-1 rounded text-black">U</button>
      </div>

      <div className="mb-4">
        <span className="block mb-2 text-black">จัดตำแหน่งข้อความ</span>
        <div className="flex space-x-2">
          <button 
            className={`border px-3 py-1 rounded text-black ${textAlign === 'left' ? 'bg-gray-300' : ''}`}
            onClick={() => setTextAlign('left')}
          >
            ซ้าย
          </button>
          <button 
            className={`border px-3 py-1 rounded text-black ${textAlign === 'center' ? 'bg-gray-300' : ''}`}
            onClick={() => setTextAlign('center')}
          >
            กลาง
          </button>
          <button 
            className={`border px-3 py-1 rounded text-black ${textAlign === 'right' ? 'bg-gray-300' : ''}`}
            onClick={() => setTextAlign('right')}
          >
            ขวา
          </button>
        </div>
      </div>

      <div className="mb-4">
        <span className="block mb-2 text-black">ขนาดตัวอักษร</span>
        <select 
          className="border rounded w-full px-3 py-1 text-black"
          value={fontSize} 
          onChange={(e) => setFontSize(e.target.value)}
        >
          <option value="">เลือกขนาดตัวอักษร</option>
          <option value="small">เล็ก</option>
          <option value="medium">กลาง</option>
          <option value="large">ใหญ่</option>
        </select>
      </div>

      <div className="mb-4">
        <span className="block mb-2 text-black">สีตัวอักษร</span>
        <div className="flex items-center space-x-2">
          <div 
            className="w-6 h-6 rounded cursor-pointer" 
            style={{ backgroundColor: textColor }}
            onClick={() => setShowTextColorPicker(!showTextColorPicker)}
          ></div>
          <button 
            className="border rounded px-3 py-1 text-black"
            onClick={() => setShowTextColorPicker(!showTextColorPicker)}
          >
            {textColor}
          </button>
          {showTextColorPicker && (
            <ColorPicker 
              color={textColor} 
              onChange={setTextColor} 
              onClose={() => setShowTextColorPicker(false)}
            />
          )}
        </div>
      </div>

      <div className="mb-4">
        <span className="block mb-2 text-black">สีพื้นหลัง</span>
        <div className="flex items-center space-x-2">
          <div 
            className="w-6 h-6 rounded cursor-pointer" 
            style={{ backgroundColor: backgroundColor }}
            onClick={() => setShowBackgroundColorPicker(!showBackgroundColorPicker)}
          ></div>
          <button 
            className="border rounded px-3 py-1 text-black"
            onClick={() => setShowBackgroundColorPicker(!showBackgroundColorPicker)}
          >
            {backgroundColor}
          </button>
          {showBackgroundColorPicker && (
            <ColorPicker 
              color={backgroundColor} 
              onChange={setBackgroundColor} 
              onClose={() => setShowBackgroundColorPicker(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TextEditor;