// File: ColorPicker.js
'use client';
import { HexColorPicker } from 'react-colorful';

const ColorPicker = ({ color, onChange, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 ">
      <div className="bg-white p-4 rounded-lg shadow-md relative">
        <button 
          className="absolute top-2 right-2 text-gray-600"
          onClick={onClose}
        >
          &times;
        </button>
        <HexColorPicker color={color} onChange={onChange} />
        <div className="flex justify-end space-x-4 mt-6">
          <button
            className="border px-3 py-1 rounded-full text-black bg-gray-200"
            onClick={onClose}
          >
            ยกเลิก
          </button>
          <button
            className="border px-3 py-1 rounded-full text-white bg-[#03A9F4]"
            onClick={onClose}
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;