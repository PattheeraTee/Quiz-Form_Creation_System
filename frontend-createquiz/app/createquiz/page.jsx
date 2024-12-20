'use client';
import { useState } from 'react';
import Question from "./question/page";
import HeaderQuiz from "./header/page";
import Setting from "./settings/page";
import Response from "../components/response/page";

export default function Page() {
  // Set 'คำถาม' as the default section
  const [selectedSection, setSelectedSection] = useState('คำถาม');

  const handleSectionSelect = (section) => {
    console.log('Selected Section:', section);
    setSelectedSection(section);
  };

  return (
    <div className='bg-gray-100 h-screen'>
      <HeaderQuiz onSectionSelect={handleSectionSelect} />
      {selectedSection === 'คำถาม' && <Question />}
      {selectedSection === 'การตอบกลับ' && <Response />}
      {selectedSection === 'ตั้งค่า' && <Setting />}
    </div>
  );
}
