'use client';
import { useState } from 'react';
import ColorPicker from '../colorpicker/page';

export default function ThemeCustomizer() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [font, setFont] = useState('Arial');
  const [textColor, setTextColor] = useState('#89E78D');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(true);

  const handleFontChange = (e) => setFont(e.target.value);
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    showThemeCustomizer && (
      <div className="p-4 w-1/6 fixed mt-9 right-2 bg-white rounded-lg shadow-md text-black">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">ธีม</h2>
          <button className="text-xl cursor-pointer" onClick={() => setShowThemeCustomizer(false)}>X</button>
        </div>
        <div className="mt-5">
          <label htmlFor="font" className="block mb-2">เลือกรูปแบบข้อความ</label>
          <select id="font" value={font} onChange={handleFontChange} className="w-full p-2 border rounded border-gray-300">
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
          </select>
        </div>
        <div className="mt-5">
          <label className="block mb-2">พื้นหลัง</label>
          <div className="grid grid-cols-3 gap-3">
            <img src="https://www.freevector.com/uploads/vector/preview/28148/EducationBackground_Preview_03.jpg" alt="India" className="w-20 h-16 object-cover cursor-pointer rounded-xl" />
            <img src="https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTAyL21vdGFybzdfaWxsdXN0cmF0aW9uX29mX25lb25fZ2FtZV9iYWNrZ3JvdW5kX2NvbG91cl9maWxtX25lZ2F0aV82NGQxNGE2MC01ZjhiLTQ5ZTQtYTRhNS04OTM0NjU3MDY4OGRfMS5qcGc.jpg" alt="Game Night" className="w-20 h-16 object-cover cursor-pointer rounded" />
            <img src="https://png.pngtree.com/background/20230618/original/pngtree-halloween-wallpapers-and-backgrounds-for-laptop-or-desktop-picture-image_3712599.jpg" alt="Halloween" className="w-20 h-16 object-cover cursor-pointer rounded" />
            <img src="https://img.freepik.com/premium-vector/movie-cinema-premiere-background_41737-251.jpg" alt="Who am I?" className="w-20 h-16 object-cover cursor-pointer rounded" />
            <img src="https://img.freepik.com/free-vector/flat-chinese-new-year-festival-celebration-background_23-2149919775.jpg" alt="China" className="w-20 h-16 object-cover cursor-pointer rounded" />
            <img src="https://static.vecteezy.com/system/resources/previews/020/323/090/non_2x/8-bit-retro-game-background-free-vector.jpg" alt="Cinema" className="w-20 h-16 object-cover cursor-pointer rounded" />
          </div>
          <div className="mt-3">
            <label htmlFor="upload-background" className="block mb-2">อัพโหลดรูปภาพพื้นหลัง</label>
            <input type="file" id="upload-background" accept="image/jpg, image/jpeg, image/png" className="w-full p-2 border rounded" onChange={handleImageUpload} />
            {uploadedImage && (
              <img src={uploadedImage} alt="Uploaded Background" className="w-20 h-16 object-cover cursor-pointer rounded-xl mt-3" />
            )}
          </div>
        </div>
        <div className="mt-5 space-y-3">
          <div>
            <label htmlFor="text-color" className="block mb-2">สีตัวอักษร</label>
            <div className="flex items-center space-x-2">
              <div 
                className="w-6 h-6 rounded cursor-pointer" 
                style={{ backgroundColor: textColor }}
                onClick={() => setShowTextColorPicker(!showTextColorPicker)}
              ></div>
              <button 
                className="border rounded border-gray-300 px-3 py-1 text-black"
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
          <div>
            <label htmlFor="background-color" className="block mb-2">สีพื้นหลัง</label>
            <div className="flex items-center space-x-2">
              <div 
                className="w-6 h-6 rounded border-gray-300 cursor-pointer" 
                style={{ backgroundColor: backgroundColor }}
                onClick={() => setShowBackgroundColorPicker(!showBackgroundColorPicker)}
              ></div>
              <button 
                className="border rounded border-gray-300 px-3 py-1 text-black"
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
      </div>
    )
  );
}
